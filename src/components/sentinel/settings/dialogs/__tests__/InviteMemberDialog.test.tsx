import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { InviteMemberDialog } from "../InviteMemberDialog";

afterEach(() => cleanup());

function renderDialog(overrides: Partial<Parameters<typeof InviteMemberDialog>[0]> = {}) {
  const props = {
    email: "",
    onEmailChange: vi.fn(),
    role: "member",
    onRoleChange: vi.fn(),
    sending: false,
    onClose: vi.fn(),
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    ...overrides,
  };
  return { props, ...render(<InviteMemberDialog {...props} />) };
}

describe("InviteMemberDialog", () => {
  it("disables submit until an email is entered", () => {
    renderDialog();
    expect(
      screen.getByRole("button", { name: /send invitation/i })
    ).toBeDisabled();
  });

  it("enables submit when an email is provided", () => {
    renderDialog({ email: "colleague@company.com" });
    expect(
      screen.getByRole("button", { name: /send invitation/i })
    ).not.toBeDisabled();
  });

  it("propagates email and role changes", () => {
    const { props } = renderDialog();
    fireEvent.change(screen.getByPlaceholderText("colleague@company.com"), {
      target: { value: "x@y.com" },
    });
    expect(props.onEmailChange).toHaveBeenLastCalledWith("x@y.com");

    fireEvent.change(screen.getByDisplayValue("Member"), {
      target: { value: "admin" },
    });
    expect(props.onRoleChange).toHaveBeenLastCalledWith("admin");
  });

  it("renders the in-flight label while sending", () => {
    renderDialog({ email: "x@y.com", sending: true });
    expect(
      screen.getByRole("button", { name: /sending…/i })
    ).toBeInTheDocument();
  });
});
