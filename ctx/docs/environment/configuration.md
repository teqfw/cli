# Environment Configuration

- Path: `ctx/docs/environment/configuration.md`
- Changed: `20260726`

## Root Package

The binary derives the application root from the entry script path and current installation context.
Acceptance tests provide their fixture application root by setting the subprocess working directory.

Every participating package may declare:

```json
{
  "teqfw": {
    "namespaces": [
      {"prefix": "Vendor_Package_", "path": "./src", "ext": ".mjs"}
    ],
    "providers": {
      "cli": ["Vendor_Package_Back_Cli_Provider$"]
    }
  }
}
```

`providers.cli` is optional.
When present it must be an array of unique valid TeqFW CDC strings.

## Package Configuration

`@teqfw/cli` declares namespace prefix `TeqFw_Cli_` mapped to `./src` with `.mjs`.
The executable name is `teq`.
There are no host environment variables in the public 0.1.0 contract.
