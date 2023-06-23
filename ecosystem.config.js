module.exports = {
  apps: [
      {
          name: "ZMaisonEDTv2",
          script: "./index.js",
          env: {
              "DISCORD_TOKEN": "MTAxNDE3MzM5NjUzNzQ2Mjg2NA.G__s8H.9H5QZyfBwcKLYLGIaaem2inLUmHde_ePSL-s-s",
              "DISCORD_ID": "1014173396537462864",
              "DISCORD_SERVER_ID": "610928463590981634",
              "DISCORD_CHANNEL_BOT_MEME_SPAM_ID": "611864040699985931",
              "DISCORD_CHANNEL_MEDIA_ID": "1040635747604123709",
              "DISCORD_CHANNEL_CHOIXPEAU_MAGIQUE_ID": "1021418453556531292",
              "DISCORD_CHANNEL_SCORE_ID": "1021421913358205040",
              "DISCORD_CATEGORY_STAFF_ID": "696640540183101520",
              "MYSQL_HOST": "172.22.0.2",
              "MYSQL_PORT": "3306",
              "MYSQL_USER": "ZUser",
              "MYSQL_PASSWORD": "ZPasswd#",
              "MYSQL_DATABASE": "ZMaisonEDT",
          },
          time: true,
          max_restarts: 20,
          restart_delay: 4000
      }
  ]
}