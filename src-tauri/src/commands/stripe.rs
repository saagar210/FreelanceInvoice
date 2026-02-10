use tauri::State;

use crate::db::invoices;
use crate::error::{AppError, AppResult};
use crate::services::{licensing, stripe};
use crate::DbState;

#[tauri::command]
pub async fn create_payment_link(
    state: State<'_, DbState>,
    api_key: String,
    invoice_id: String,
) -> AppResult<String> {
    // Check tier and get invoice data under the lock, then release
    let (total, description) = {
        let conn = state.0.lock().map_err(|e| {
            AppError::Database(rusqlite::Error::InvalidParameterName(e.to_string()))
        })?;

        licensing::check_stripe_access(&conn)?;

        let invoice = invoices::get_invoice(&conn, &invoice_id)?;
        let desc = format!("Invoice {}", invoice.invoice_number);
        (invoice.total, desc)
    };

    let amount_cents = (total * 100.0) as i64;

    let url = stripe::create_checkout_session(
        &api_key,
        amount_cents,
        "usd",
        &description,
        "https://example.com/payment-success",
        "https://example.com/payment-cancelled",
    )
    .await?;

    // Save payment link under a new lock
    let conn = state.0.lock().map_err(|e| {
        AppError::Database(rusqlite::Error::InvalidParameterName(e.to_string()))
    })?;

    invoices::set_payment_link(&conn, &invoice_id, &url)?;

    Ok(url)
}
