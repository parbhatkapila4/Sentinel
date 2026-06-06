import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  CancelSubscriptionDialog,
  DeleteAccountDialog,
  RemovePaymentDialog,
} from "../ConfirmDialogs";

afterEach(() => cleanup());

describe("CancelSubscriptionDialog", () => {
  it("renders the title and both action buttons", () => {
    render(<CancelSubscriptionDialog onClose={() => {}} onConfirm={() => {}} />);
    expect(screen.getByText("Cancel subscription?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /keep subscription/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /email cancellation request/i })).toBeInTheDocument();
  });

  it("calls onConfirm when the destructive button is pressed", () => {
    const onConfirm = vi.fn();
    render(<CancelSubscriptionDialog onClose={() => {}} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: /email cancellation request/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the keep button is pressed", () => {
    const onClose = vi.fn();
    render(<CancelSubscriptionDialog onClose={onClose} onConfirm={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /keep subscription/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("RemovePaymentDialog", () => {
  it("renders the warning copy", () => {
    render(<RemovePaymentDialog onClose={() => {}} onConfirm={() => {}} />);
    expect(screen.getByText("Remove payment method?")).toBeInTheDocument();
  });

  it("invokes onConfirm on Remove", () => {
    const onConfirm = vi.fn();
    render(<RemovePaymentDialog onClose={() => {}} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: /^remove$/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe("DeleteAccountDialog", () => {
  it("disables the destructive button until DELETE is typed", () => {
    const onConfirm = vi.fn();
    const { rerender } = render(
      <DeleteAccountDialog
        confirmText=""
        onConfirmTextChange={() => {}}
        deleting={false}
        onClose={() => {}}
        onConfirm={onConfirm}
      />
    );
    const button = screen.getByRole("button", { name: /delete account/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onConfirm).not.toHaveBeenCalled();

    rerender(
      <DeleteAccountDialog
        confirmText="DELETE"
        onConfirmTextChange={() => {}}
        deleting={false}
        onClose={() => {}}
        onConfirm={onConfirm}
      />
    );
    expect(screen.getByRole("button", { name: /delete account/i })).not.toBeDisabled();
  });

  it("propagates input changes via onConfirmTextChange", () => {
    const onConfirmTextChange = vi.fn();
    render(
      <DeleteAccountDialog
        confirmText=""
        onConfirmTextChange={onConfirmTextChange}
        deleting={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );
    fireEvent.change(screen.getByPlaceholderText("DELETE"), {
      target: { value: "DELETE" },
    });
    expect(onConfirmTextChange).toHaveBeenLastCalledWith("DELETE");
  });

  it("shows the in-flight label when deleting", () => {
    render(
      <DeleteAccountDialog
        confirmText="DELETE"
        onConfirmTextChange={() => {}}
        deleting
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: /deleting/i })).toBeInTheDocument();
  });
});
