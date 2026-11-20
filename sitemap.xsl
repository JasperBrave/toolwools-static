<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>ToolWools sitemap</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;margin:2rem auto;max-width:1100px;padding:0 1rem;color:#1a1a2e;line-height:1.5}h1{font-size:1.6rem}table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{border:1px solid #ddd;padding:.45rem .6rem;text-align:left;vertical-align:top}th{background:#f2f2f7}td a{color:#3b4fd8;word-break:break-all}.alt{white-space:nowrap}.muted{color:#666}</style>
      </head>
      <body>
        <h1>ToolWools sitemap</h1>
        <p class="muted">This is the XML sitemap for toolwools.com, listing every page search engines should crawl. It is generated from the site build; the raw XML is what crawlers read.</p>
        <xsl:apply-templates select="s:urlset"/>
        <xsl:apply-templates select="s:sitemapindex"/>
      </body>
    </html>
  </xsl:template>
  <xsl:template match="s:urlset">
    <p><xsl:value-of select="count(s:url)"/> URLs</p>
    <table>
      <thead><tr><th>URL</th><th>Last modified</th><th>Change freq.</th><th>Priority</th><th>Language alternates</th></tr></thead>
      <tbody>
        <xsl:for-each select="s:url">
          <tr>
            <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
            <td><xsl:value-of select="s:lastmod"/></td>
            <td><xsl:value-of select="s:changefreq"/></td>
            <td><xsl:value-of select="s:priority"/></td>
            <td class="alt"><xsl:for-each select="xhtml:link"><span><xsl:value-of select="@hreflang"/></span><xsl:text> </xsl:text></xsl:for-each></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
  </xsl:template>
  <xsl:template match="s:sitemapindex">
    <p><xsl:value-of select="count(s:sitemap)"/> sitemaps</p>
    <table>
      <thead><tr><th>Sitemap</th><th>Last modified</th></tr></thead>
      <tbody>
        <xsl:for-each select="s:sitemap">
          <tr>
            <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
            <td><xsl:value-of select="s:lastmod"/></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
  </xsl:template>
</xsl:stylesheet>
