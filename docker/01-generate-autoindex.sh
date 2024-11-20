#!/usr/bin/env sh

SITE_CONFIG="    window.siteConfig = window.siteConfig || {};"

if [ -n "$SITECONFIG_NAME" ]; then
  SITE_CONFIG=$(cat <<- EOF
${SITE_CONFIG}
    window.siteConfig.name = "${SITECONFIG_NAME}";
EOF
  )
fi

if [ -n "$SITECONFIG_TITLE" ]; then
  SITE_CONFIG=$(cat <<- EOF
${SITE_CONFIG}
    window.siteConfig.title = "${SITECONFIG_TITLE}";
EOF
  )
fi

if [ -n "$SITECONFIG_FOOTER" ]; then
  SITE_CONFIG=$(cat <<- EOF
${SITE_CONFIG}
    window.siteConfig.footer = "${SITECONFIG_FOOTER}";
EOF
  )
fi

if [ -n "$SITECONFIG_README" ]; then
  if [ "$SITECONFIG_README" = "true" ] || [ "$SITECONFIG_README" = "false" ]; then
    SITE_CONFIG=$(cat <<- EOF
${SITE_CONFIG}
    window.siteConfig.readme = ${SITECONFIG_README};
EOF
    )
  else
    SITE_CONFIG=$(cat <<- EOF
${SITE_CONFIG}
    window.siteConfig.readme = "${SITECONFIG_README}";
EOF
    )
  fi
fi

if [ "$SITECONFIG_BEFORE" = "true" ] || [ "$SITECONFIG_BEFORE" = "false" ]; then
  SITE_CONFIG=$(cat <<- EOF
${SITE_CONFIG}
    window.siteConfig.before = ${SITECONFIG_BEFORE};
EOF
  )
fi

awk -v config="$SITE_CONFIG" '{
    if ($0 ~ /@@DOCKER_CONFIG_START@@/) {
        in_config_block = 1;
        print;
        printf("%s\n", config);
        next;
    }
    if ($0 ~ /@@DOCKER_CONFIG_END@@/) {
        in_config_block = 0;
    }
    if (!in_config_block) {
        print;
    }
}' /var/www/autoindex/autoindex.html > /tmp/autoindex.html.tmp
mv /tmp/autoindex.html.tmp /var/www/autoindex/autoindex.html
