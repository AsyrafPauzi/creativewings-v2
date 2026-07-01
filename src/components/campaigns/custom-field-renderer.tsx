import type { CustomFieldRow } from "@/lib/supabase/database.types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CustomFieldRenderer({ fields }: { fields: CustomFieldRow[] }) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const name = `custom_field_${field.id}`;
        const required = field.required;
        const label = (
          <Label htmlFor={name}>
            {field.label}
            {required && <span className="text-destructive"> *</span>}
          </Label>
        );

        if (field.field_type === "textarea") {
          return (
            <div key={field.id} className="space-y-2">
              {label}
              <Textarea id={name} name={name} rows={4} required={required} />
            </div>
          );
        }

        if (field.field_type === "select") {
          const options = (field.options ?? "")
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean);
          return (
            <div key={field.id} className="space-y-2">
              {label}
              <Select id={name} name={name} required={required}>
                <option value="">Select…</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>
          );
        }

        if (field.field_type === "checkbox") {
          return (
            <label key={field.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={name} value="yes" required={required} />
              {field.label}
            </label>
          );
        }

        if (field.field_type === "file") {
          return (
            <div key={field.id} className="space-y-2">
              {label}
              <Input
                id={name}
                name={name}
                type="file"
                required={required}
                accept="image/jpeg,image/png,image/webp,application/pdf"
              />
            </div>
          );
        }

        const inputType =
          field.field_type === "number"
            ? "number"
            : field.field_type === "email"
              ? "email"
              : field.field_type === "phone"
                ? "tel"
                : field.field_type === "date"
                  ? "date"
                  : "text";

        return (
          <div key={field.id} className="space-y-2">
            {label}
            <Input id={name} name={name} type={inputType} required={required} />
          </div>
        );
      })}
    </div>
  );
}
