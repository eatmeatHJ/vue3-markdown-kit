# Security policy

## Supported versions

Only the latest released minor version receives security updates.

## Reporting a vulnerability

Please report suspected vulnerabilities privately through GitHub's private
vulnerability reporting feature. Do not include exploit details in a public
issue before a fix is available.

Markdown rendering is performed in the browser. Rendered HTML is sanitized by
DOMPurify before it reaches Vue's `innerHTML` render property.
