#!/bin/sh
# Places the SPA under $BASE_PATH and writes nginx config.
# Runs in /docker-entrypoint.d/ before nginx starts.
set -e

BASE_PATH="${BASE_PATH:-/knowledge-lever-simulator/}"

# Ensure leading and trailing slash (root stays "/")
case "$BASE_PATH" in
  /*) ;;
  *) BASE_PATH="/$BASE_PATH" ;;
esac
case "$BASE_PATH" in
  /) ;;
  */) ;;
  *) BASE_PATH="${BASE_PATH}/" ;;
esac

SRC=/usr/share/nginx/app
HTML=/usr/share/nginx/html

rm -rf "${HTML:?}/"*

if [ "$BASE_PATH" = "/" ]; then
  cp -a "$SRC"/. "$HTML"/
  FALLBACK=/index.html
  ASSETS_LOCATION=/assets/
  EXTRA_REDIRECT=""
else
  dest="${HTML}${BASE_PATH}"
  mkdir -p "$dest"
  cp -a "$SRC"/. "$dest"
  FALLBACK="${BASE_PATH}index.html"
  ASSETS_LOCATION="${BASE_PATH}assets/"
  # /path → /path/
  trim="${BASE_PATH%/}"
  EXTRA_REDIRECT="location = ${trim} { return 301 ${BASE_PATH}; }"
fi

cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    ${EXTRA_REDIRECT}

    location ${BASE_PATH} {
        try_files \$uri \$uri/ ${FALLBACK};
    }

    location ${ASSETS_LOCATION} {
        try_files \$uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location = ${FALLBACK} {
        add_header Cache-Control "no-cache";
    }
}
EOF

echo "Serving SPA at BASE_PATH=${BASE_PATH} (port 8080)"
