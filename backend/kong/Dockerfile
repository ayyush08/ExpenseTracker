FROM kong:latest

# Copy the custom-auth plugin into Kong's Lua plugin directory
COPY plugins/custom-auth/handler.lua /usr/local/share/lua/5.1/kong/plugins/custom-auth/handler.lua
COPY plugins/custom-auth/schema.lua  /usr/local/share/lua/5.1/kong/plugins/custom-auth/schema.lua
