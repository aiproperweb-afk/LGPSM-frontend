"use client";

import React, { useState } from "react";
import EditOrganizerModal from "./EditOrganizerModal";
import EraseOrganizerDialog from "./EraseOrganizerDialog";
import { userService } from "@/services/userService";
import type { UserData } from "@/services/tokenStorage";
import { useAlert } from "@/context/AlertContext";

const nameOf = (o: UserData) => o.profile?.organizationName || o.fullName || o.email;

/**
 * Edit, activate, deactivate and delete for an organizer, shared by the list and the detail page. `dialogs` is rendered by the page.
 * `changed` runs after a saved change, `erased` after a permanent deletion.
 */
export function useOrganizerActions({ changed, erased }: { changed: () => void; erased: () => void }) {
  const { confirm, showAlert } = useAlert();
  const [editing, setEditing] = useState<UserData | null>(null);
  const [erasing, setErasing] = useState<UserData | null>(null);

  const setActive = async (o: UserData, active: boolean) => {
    const yes = await confirm(active
      ? { title: "Activate organizer?", message: `${nameOf(o)} will be able to sign in and manage their events again.`, confirmText: "Activate" }
      : { title: "Deactivate organizer?", message: `${nameOf(o)} is signed out and cannot sign in until activated again. Their events and records are kept.`, confirmText: "Deactivate", tone: "danger" });
    if (!yes) return;
    const res = await userService.updateUser(o._id, { isActive: active });
    if (!res.success) return showAlert(res.message || `The organizer could not be ${active ? "activated" : "deactivated"}.`, "error");
    showAlert(`${nameOf(o)} was ${active ? "activated" : "deactivated"}.`, "success");
    changed();
  };

  const dialogs = (
    <>
      {editing && <EditOrganizerModal organizer={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); showAlert("Organizer updated.", "success"); changed(); }} />}
      {erasing && <EraseOrganizerDialog organizerId={erasing._id} name={nameOf(erasing)} onClose={() => setErasing(null)} onErased={() => { const gone = nameOf(erasing); setErasing(null); showAlert(`${gone} was deleted permanently.`, "success"); erased(); }} />}
    </>
  );

  return { edit: setEditing, erase: setErasing, setActive, dialogs };
}
