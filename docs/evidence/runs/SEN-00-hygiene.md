# SEN-00 hygiene

Base: 58254730d155b13e9e8a22d8354be30126297e0d

Approved removal from V2 branch tree: 10898 tracked generated files, including virtual environments, IDE files, bytecode and installer. No legacy source or image assets selected. The main ref and original history are not rewritten.

Tool: GitHub Git tree API, not local git rm. Local git ls-remote failed with DNS error (exit 128); Maven, Docker and gitleaks absent. Full history secret scan BLOCKED. No claim of secret-free history. Verify tree before updating ref.
