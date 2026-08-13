/**
 * Standardized API response wrapper.
 * Ensures every response has a consistent shape:
 * { success, message, data? }
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message    - Human-readable message
   * @param {*}     [data]      - Response payload (omitted if undefined/null)
   */
  constructor(statusCode, message, data) {
    this.success = statusCode >= 200 && statusCode < 400;
    this.message = message;
    if (data !== undefined && data !== null) {
      this.data = data;
    }
  }
}

module.exports = ApiResponse;
