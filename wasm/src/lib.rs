use wasm_bindgen::prelude::*;
use base64::{Engine as _, engine::general_purpose};
use urlencoding::{encode, decode};
use sha2::{Sha224, Sha256, Sha384, Sha512, Digest};
use sha1::Sha1;
use md5;
use hmac::{Hmac, Mac};
use hex;

type HmacSha256 = Hmac<Sha256>;
type HmacSha512 = Hmac<Sha512>;
type HmacSha1 = Hmac<Sha1>;

#[wasm_bindgen]
pub fn json_format(input: &str, indent: u32) -> Result<String, JsValue> {
    let value: serde_json::Value = serde_json::from_str(input)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    let indent_str = " ".repeat(indent as usize);
    let formatted = serde_json::to_string_pretty(&value)
        .map_err(|e| JsValue::from_str(&e.to_string()))?
        .replace("  ", &indent_str);
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

#[wasm_bindgen]
pub fn base64_encode(input: &str) -> String {
    general_purpose::STANDARD.encode(input.as_bytes())
}

#[wasm_bindgen]
pub fn base64_decode(input: &str) -> Result<String, JsValue> {
    let decoded = general_purpose::STANDARD.decode(input)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    String::from_utf8(decoded)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub fn base64_url_encode(input: &str) -> String {
    general_purpose::URL_SAFE_NO_PAD.encode(input.as_bytes())
}

#[wasm_bindgen]
pub fn base64_url_decode(input: &str) -> Result<String, JsValue> {
    let decoded = general_purpose::URL_SAFE_NO_PAD.decode(input)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    String::from_utf8(decoded)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub fn url_encode(input: &str) -> String {
    encode(input).to_string()
}

#[wasm_bindgen]
pub fn url_decode(input: &str) -> Result<String, JsValue> {
    decode(input)
        .map_err(|e| JsValue::from_str(&e.to_string()))
        .map(|s| s.to_string())
}

#[wasm_bindgen]
pub fn sha256_hash(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}

#[wasm_bindgen]
pub fn sha512_hash(input: &str) -> String {
    let mut hasher = Sha512::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}

#[wasm_bindgen]
pub fn sha1_hash(input: &str) -> String {
    let mut hasher = Sha1::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}

#[wasm_bindgen]
pub fn sha224_hash(input: &str) -> String {
    let mut hasher = Sha224::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}

#[wasm_bindgen]
pub fn sha384_hash(input: &str) -> String {
    let mut hasher = Sha384::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}

#[wasm_bindgen]
pub fn md5_hash(input: &str) -> String {
    let digest = md5::compute(input.as_bytes());
    hex::encode(digest.0)
}

#[wasm_bindgen]
pub fn hmac_sha256(input: &str, key: &str) -> String {
    let mut mac = HmacSha256::new_from_slice(key.as_bytes()).unwrap();
    mac.update(input.as_bytes());
    hex::encode(mac.finalize().into_bytes())
}

#[wasm_bindgen]
pub fn hmac_sha512(input: &str, key: &str) -> String {
    let mut mac = HmacSha512::new_from_slice(key.as_bytes()).unwrap();
    mac.update(input.as_bytes());
    hex::encode(mac.finalize().into_bytes())
}

#[wasm_bindgen]
pub fn hmac_sha1(input: &str, key: &str) -> String {
    let mut mac = HmacSha1::new_from_slice(key.as_bytes()).unwrap();
    mac.update(input.as_bytes());
    hex::encode(mac.finalize().into_bytes())
}