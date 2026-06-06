"use client";

import { CARD_BRANDS } from "@/lib/payment-methods";
import {
  EditorialButton,
  EditorialInput,
  EditorialModal,
  EditorialSelect,
  Field,
  ModalActions,
} from "../primitives";

export interface PaymentEditFormState {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  setAsDefault: boolean;
}

export function EditPaymentDialog({
  form,
  onFormChange,
  saving,
  onClose,
  onSubmit,
}: {
  form: PaymentEditFormState;
  onFormChange: (
    updater: (prev: PaymentEditFormState) => PaymentEditFormState
  ) => void;
  saving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <EditorialModal
      onClose={() => !saving && onClose()}
      title="Update payment method."
      subtitle="Edit the details we keep on file for this card."
    >
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <Field label="Card brand">
          <EditorialSelect
            value={form.brand}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, brand: e.target.value }))
            }
          >
            {CARD_BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </EditorialSelect>
        </Field>
        <Field label="Last 4 digits">
          <EditorialInput
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="4242"
            value={form.last4}
            onChange={(e) =>
              onFormChange((f) => ({
                ...f,
                last4: e.target.value.replace(/\D/g, "").slice(0, 4),
              }))
            }
          />
        </Field>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <Field label="Exp. month">
            <EditorialSelect
              value={form.expMonth}
              onChange={(e) =>
                onFormChange((f) => ({
                  ...f,
                  expMonth: Number(e.target.value),
                }))
              }
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, "0")}
                </option>
              ))}
            </EditorialSelect>
          </Field>
          <Field label="Exp. year">
            <EditorialSelect
              value={form.expYear}
              onChange={(e) =>
                onFormChange((f) => ({
                  ...f,
                  expYear: Number(e.target.value),
                }))
              }
            >
              {Array.from(
                { length: 15 },
                (_, i) => new Date().getFullYear() + i
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </EditorialSelect>
          </Field>
        </div>
        <ModalActions>
          <EditorialButton
            type="button"
            onClick={() => !saving && onClose()}
            disabled={saving}
          >
            Cancel
          </EditorialButton>
          <EditorialButton type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Update ⏎"}
          </EditorialButton>
        </ModalActions>
      </form>
    </EditorialModal>
  );
}
