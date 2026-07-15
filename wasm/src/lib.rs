use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn json_format(input: &str, indent: u32) -> Result<String, JsValue> {
    let value: serde_json::Value = serde_json::from_str(input)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    let formatted = serde_json::to_string_pretty(&value)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(formatted)
}

#[wasm_bindgen]
pub fn json_minify(input: &str) -> Result<String, JsValue> {
    let value: serde_json::Value = serde_json::from_str(input)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    let minified = serde_json::to_string(&value)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(minified)
}

#[wasm_bindgen]
pub fn json_validate(input: &str) -> bool {
    serde_json::from_str::<serde_json::Value>(input).is_ok()
}
