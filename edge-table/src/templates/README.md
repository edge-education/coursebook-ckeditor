# CKEditor Table Templates

This directory contains the table templates used by the CKEditor table template picker.

## Structure

- `templates.json` - Configuration file listing all available templates
- `*.html` - Individual HTML template files

## Usage

### Adding a New Template

1. Create an HTML file containing your table template (e.g., `my-custom-table.html`)
2. Add an entry to `templates.json`:
   ```json
   {
     "id": 4,
     "name": "My Custom Table",
     "filename": "my-custom-table.html"
   }
   ```

### Template Format

Templates should be valid HTML containing a `<figure class="table">` element with the table structure.

Example:
```html
<figure class="table" style="width:130mm;">
  <table>
    <tbody>
      <tr>
        <td>Content here</td>
      </tr>
    </tbody>
  </table>
</figure>
```

### Deployment

After adding or modifying templates:

1. Ensure the templates directory is served alongside your CKEditor build
2. The templates will be loaded dynamically when the table template picker is used
3. No rebuild of CKEditor is required - templates are loaded on demand

### Fallback

If the dynamic template loading fails, the system will fall back to the hardcoded templates in the JavaScript code.