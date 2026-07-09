local kong = kong
local http = require "resty.http"

local CustomAuthHandler = {
  PRIORITY = 1000,
  VERSION  = "1.0",
}

function CustomAuthHandler:access(config)
  local auth_header = kong.request.get_header("Authorization")

  -- Reject immediately if no Authorization header is present
  if not auth_header then
    return kong.response.exit(401, { message = "Missing Authorization header" })
  end

  -- Call the AuthService /auth/v1/ping endpoint to validate the token
  local auth_service_url = config.auth_service_url

  local httpc = http.new()
  httpc:set_timeouts(10000, 10000, 10000) -- connect, send, read (ms)

  local res, err = httpc:request_uri(auth_service_url, {
    method  = "GET",
    headers = {
      ["Authorization"] = auth_header,
    },
  })

  if not res then
    kong.log.err("custom-auth: failed to call auth service: ", err)
    return kong.response.exit(500, { message = "Internal Server Error" })
  end

  if res.status ~= 200 then
    return kong.response.exit(res.status, { message = "Unauthorized" })
  end

  -- The AuthService returns the userId as a plain or JSON-quoted string.
  -- Strip surrounding double-quotes if present (Spring ResponseEntity<String>
  -- serialises as `"some-id"` with quotes when the Accept header is JSON).
  local user_id = res.body
  if user_id then
    user_id = user_id:match('^"?(.-)"?$') -- strip optional surrounding quotes
  end

  if not user_id or user_id == "" then
    kong.log.err("custom-auth: auth service returned empty user id")
    return kong.response.exit(500, { message = "Internal Server Error" })
  end

  -- Forward the authenticated user id to the downstream service.
  -- Header casing matches what expense-service expects: X-User-Id
  kong.service.request.set_header("X-User-Id", user_id)
end

return CustomAuthHandler
