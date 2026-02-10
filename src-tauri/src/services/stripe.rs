use serde::Deserialize;

use crate::error::{AppError, AppResult};

#[derive(Debug, Deserialize)]
struct CheckoutSession {
    url: Option<String>,
}

pub async fn create_checkout_session(
    api_key: &str,
    amount_cents: i64,
    currency: &str,
    description: &str,
    success_url: &str,
    cancel_url: &str,
) -> AppResult<String> {
    if api_key.is_empty() {
        return Err(AppError::Validation(
            "Stripe API key is required. Set it in Settings.".to_string(),
        ));
    }

    let client = reqwest::Client::new();

    let params = [
        ("mode", "payment".to_string()),
        ("line_items[0][price_data][currency]", currency.to_string()),
        (
            "line_items[0][price_data][unit_amount]",
            amount_cents.to_string(),
        ),
        (
            "line_items[0][price_data][product_data][name]",
            description.to_string(),
        ),
        ("line_items[0][quantity]", "1".to_string()),
        ("success_url", success_url.to_string()),
        ("cancel_url", cancel_url.to_string()),
    ];

    let response = client
        .post("https://api.stripe.com/v1/checkout/sessions")
        .basic_auth(api_key, Option::<&str>::None)
        .form(&params)
        .send()
        .await
        .map_err(|e| AppError::AiEstimation(format!("Stripe request failed: {e}")))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(AppError::AiEstimation(format!(
            "Stripe API error ({status}): {body}"
        )));
    }

    let session: CheckoutSession = response
        .json()
        .await
        .map_err(|e| AppError::AiEstimation(format!("Failed to parse Stripe response: {e}")))?;

    session.url.ok_or_else(|| {
        AppError::AiEstimation("Stripe returned no checkout URL".to_string())
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_empty_api_key_returns_error() {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let result = rt.block_on(create_checkout_session(
            "",
            1000,
            "usd",
            "Test Invoice",
            "https://example.com/success",
            "https://example.com/cancel",
        ));
        assert!(result.is_err());
    }
}
