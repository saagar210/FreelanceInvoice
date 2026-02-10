use rusqlite::Connection;

use crate::db;
use crate::error::{AppError, AppResult};
use crate::models::Tier;

impl Tier {
    pub fn from_string(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "pro" => Tier::Pro,
            "premium" => Tier::Premium,
            _ => Tier::Free,
        }
    }
}

pub fn get_current_tier(conn: &Connection) -> AppResult<Tier> {
    let tier_str: String = conn
        .query_row(
            "SELECT value FROM app_settings WHERE key = 'tier'",
            [],
            |row| row.get(0),
        )
        .unwrap_or_else(|_| "free".to_string());

    Ok(Tier::from_string(&tier_str))
}

pub fn check_invoice_limit(conn: &Connection) -> AppResult<()> {
    let tier = get_current_tier(conn)?;
    if tier == Tier::Free {
        let count = db::invoices::count_invoices_this_month(conn)?;
        if count >= 3 {
            return Err(AppError::TierLimit(
                "Free tier is limited to 3 invoices per month. Upgrade to Pro for unlimited invoices.".to_string(),
            ));
        }
    }
    Ok(())
}

pub fn check_ai_access(conn: &Connection) -> AppResult<()> {
    let tier = get_current_tier(conn)?;
    if tier == Tier::Free {
        return Err(AppError::TierLimit(
            "AI estimation requires a Pro or Premium plan.".to_string(),
        ));
    }
    Ok(())
}

pub fn check_stripe_access(conn: &Connection) -> AppResult<()> {
    let tier = get_current_tier(conn)?;
    if tier != Tier::Premium {
        return Err(AppError::TierLimit(
            "Stripe payment links require a Premium plan.".to_string(),
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::init_db_in_memory;

    #[test]
    fn test_default_tier_is_free() {
        let conn = init_db_in_memory().expect("init db");
        let tier = get_current_tier(&conn).unwrap();
        assert_eq!(tier, Tier::Free);
    }

    #[test]
    fn test_tier_from_settings() {
        let conn = init_db_in_memory().expect("init db");
        conn.execute(
            "INSERT INTO app_settings (key, value) VALUES ('tier', 'pro')",
            [],
        )
        .unwrap();
        let tier = get_current_tier(&conn).unwrap();
        assert_eq!(tier, Tier::Pro);
    }

    #[test]
    fn test_free_tier_blocks_ai() {
        let conn = init_db_in_memory().expect("init db");
        let result = check_ai_access(&conn);
        assert!(result.is_err());
    }

    #[test]
    fn test_pro_tier_allows_ai() {
        let conn = init_db_in_memory().expect("init db");
        conn.execute(
            "INSERT INTO app_settings (key, value) VALUES ('tier', 'pro')",
            [],
        )
        .unwrap();
        assert!(check_ai_access(&conn).is_ok());
    }

    #[test]
    fn test_free_tier_invoice_limit() {
        let conn = init_db_in_memory().expect("init db");
        // Should be fine with 0 invoices
        assert!(check_invoice_limit(&conn).is_ok());
    }

    #[test]
    fn test_stripe_requires_premium() {
        let conn = init_db_in_memory().expect("init db");
        assert!(check_stripe_access(&conn).is_err());

        conn.execute(
            "INSERT INTO app_settings (key, value) VALUES ('tier', 'pro')",
            [],
        )
        .unwrap();
        assert!(check_stripe_access(&conn).is_err());

        conn.execute(
            "UPDATE app_settings SET value = 'premium' WHERE key = 'tier'",
            [],
        )
        .unwrap();
        assert!(check_stripe_access(&conn).is_ok());
    }
}
