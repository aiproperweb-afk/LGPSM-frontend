"use client";

import { formatOrganizerId } from "@/utils/formatId";
import PopupMessage from "@/components/common/PopupMessage";
import OrganisationDetailsForm from "@/components/settings/OrganisationDetailsForm";
import PageHeader from "@/components/common/PageHeader";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import ChangePasswordModal from "@/components/settings/modals/ChangePasswordModal";
import AvatarSection from "@/components/settings/AvatarSection";

import { userService } from "@/services/userService";
import { useAlert } from "@/context/AlertContext";
import { resolveImageUrl } from "@/utils/mediaUrl";
import CustomDropdown from "@/components/common/CustomDropdown";
import { useRouter } from "next/navigation";
import { isOrganizationAccount } from "@/utils/accountType";
import PhoneInput from "@/components/common/PhoneInput";
import ChangeEmailModal from "@/components/settings/modals/ChangeEmailModal";
import VerifyPhoneModal from "@/components/settings/modals/VerifyPhoneModal";
import VerifyEmailModal from "@/components/settings/modals/VerifyEmailModal";


export default function AccountSettingsPage() {
  const { user, updateProfile, updateProfilePhoto, refreshUser } = useAuth();
  const { showAlert, confirm } = useAlert();
  const router = useRouter();
  // the type chosen in Edit Profile; "" = as saved
  const [chosenType, setChosenType] = useState<"" | "INDIVIDUAL" | "ORGANIZATION">("");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  // the ten digits being typed in Edit Profile; null = as saved
  const [typedPhone, setTypedPhone] = useState<string | null>(null);
  const savedPhone = (user?.phone || "").replace(/\D/g, "").slice(-10);
  const phone = typedPhone ?? savedPhone;
  const [emailOpen, setEmailOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
  const emailPending = !!user?.verificationPending?.email;
  // an account that signs in with Google keeps Google's address
  const googleAccount = user?.authProvider === "GOOGLE";
  const [password, setPassword] = useState("••••••••••••••••");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const isOrganizer = user?.role === "ORGANIZER";
  // Individual or organization (accounts from before that choice count as an organization when they have its name)
  const profileType = user?.profile as { organizationType?: string; organizationName?: string } | undefined;
  const accountType = profileType?.organizationType === "ORGANIZATION" ? "Organization" : profileType?.organizationType === "INDIVIDUAL" ? "Individual" : profileType?.organizationName ? "Organization" : "Not set";
  const field = "w-full h-[47px] px-4 bg-white border border-[#E0E0E0] rounded-md text-[13px] text-[#15191C] focus:outline-none focus:border-black";

  // the saved profile says whether the number is verified and whether it can be
  const refresh = React.useRef(refreshUser);
  useEffect(() => { void refresh.current(); }, []);

  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
    if (user?.email) setEmail(user.email);
  }, [user]);

  const savedAvatarUrl = user?.profile?.avatarUrl
    || resolveImageUrl(user?.profile?.avatarKey)
    || user?.avatarUrl
    || null;
  const avatarFallbackUrl = resolveImageUrl(user?.profile?.avatarKey, true);
  const avatarUrl = savedAvatarUrl && !/^(blob|data):/i.test(savedAvatarUrl) ? savedAvatarUrl : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const savedType = isOrganizationAccount(user) ? "ORGANIZATION" : "INDIVIDUAL";
    const nextType = isOrganizer && chosenType && chosenType !== savedType ? chosenType : null;
    if (nextType === "INDIVIDUAL" && !(await confirm({ title: "Change to an individual account", message: "Your organisation name will no longer appear on invitations and emails, and the organisation settings are hidden.", confirmText: "Change" }))) return;
    if (nextType === "ORGANIZATION" && !(await confirm({ title: "Change to an organisation account", message: "Your organisation name will appear on invitations and emails once you add it. You will be taken to Logo Settings to add your logo and organisation details.", confirmText: "Change" }))) return;
    // The name, mobile number and account type are saved here; the email address has its own window (it needs a code)
    if (isOrganizer && phone.length !== 10) return setErrorMessage("Enter your 10-digit mobile number.");
    const profile: Record<string, unknown> = { ...(user?.profile || {}), organizationType: nextType };
    if (nextType === "INDIVIDUAL") delete profile.organizationName;
    const res = await updateProfile({
      fullName: fullName.trim(),
      ...(phone && phone !== savedPhone ? { phone } : {}),
      ...(nextType ? { profile } : {}),
    });
    if (!res.success) {
      setErrorMessage(res.message || "Failed to update profile.");
      return;
    }
    setChosenType("");
    setTypedPhone(null);
    // a new organisation adds its logo and details next
    if (nextType === "ORGANIZATION") {
      showAlert("Your account is now an organisation account. Add your logo and organisation details.", "success");
      router.push("/settings/logo");
      return;
    }
    setSavedMessage(true);
    setEditing(false);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleAvatarChange = async (file: File) => {
    setErrorMessage("");
    setIsAvatarUploading(true);
    try {
      const res = await updateProfilePhoto(file);
      if (!res.success || !res.data) {
        setErrorMessage(res.message || "Failed to upload profile photo.");
        return;
      }
      const savedAvatarUrl = res.data.profile?.avatarUrl
        || resolveImageUrl(res.data.profile?.avatarKey)
        || res.data.avatarUrl
        || null;
      if (!savedAvatarUrl) {
        setErrorMessage("Photo was saved, but the server did not return an image URL.");
        return;
      }
      if (/^(blob|data):/i.test(savedAvatarUrl)) {
        setErrorMessage("The server returned a temporary image URL. Please contact support.");
        return;
      }
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setErrorMessage("");
    const res = await updateProfile({
      profile: { ...(user?.profile || {}), avatarKey: "", avatarUrl: "" },
    });
    if (!res.success) {
      setErrorMessage(res.message || "Failed to remove profile photo.");
    }
  };

  const handleUpdatePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    setErrorMessage("");
    const res = await userService.changePassword(oldPass, newPass);
    if (res.success) {
      setPassword("••••••••••••••••");
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
      return true;
    }
    const message = res.message || "Failed to update password.";
    if (res.status === 401 || /password|credential|authentication/i.test(message)) {
      showAlert(message, "error", "Incorrect password");
    } else {
      setErrorMessage(message);
    }
    return false;
  };

  const displayName = fullName || user?.fullName || user?.email || "Account Name";
  const phoneBadge = user?.isPhoneVerified
    ? <span className="inline-flex rounded-full bg-[#C0FFD5] px-2.5 py-0.5 text-xs font-medium text-[#0F7A33]">Verified</span>
    : <span className="inline-flex rounded-full bg-[#FFF3C4] px-2.5 py-0.5 text-xs font-medium text-[#8A6A00]">Unverified</span>;

  return (
    <div className="w-full min-h-full bg-white font-sans text-gray-900 select-none">
      {/* Header */}
      <PageHeader title="Account Settings" />

      {/* Figma 2171:1911 "My Profile" (default) and 2171:2034 "Edit Profile": full-width grey card, 154px photo */}
      <div className="px-4 sm:px-6 pt-10 pb-24 w-full space-y-6">
        <h2 className="text-xl font-medium text-black">{editing ? "Edit Profile" : "My Profile"}</h2>

        <PopupMessage message={savedMessage ? "Account details updated successfully!" : null} type="success" onClose={() => setSavedMessage(false)} />
        <PopupMessage message={errorMessage} onClose={() => setErrorMessage("")} />

        {!editing ? (
          <section className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg p-8 flex flex-col sm:flex-row items-start sm:items-center gap-10" aria-label="My profile">
            <span className="relative size-[154px] shrink-0 rounded-full overflow-hidden bg-[#D9D9D9] flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- local preview or stored avatar URL
                <img
                  src={avatarUrl}
                  alt="Profile photo"
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    if (avatarFallbackUrl && event.currentTarget.src !== avatarFallbackUrl) {
                      event.currentTarget.src = avatarFallbackUrl;
                    }
                  }}
                />
              ) : (
                <Image src="/images/header/avatar-user.svg" alt="" width={68} height={68} />
              )}
            </span>
            <div className="min-w-0 space-y-1.5">
              <p className="text-[32px] leading-tight font-medium text-black break-words">{displayName}</p>
              <p className="flex flex-wrap items-center gap-2 text-xl text-black">
                <span className="break-all">{email}</span>
                {emailPending && (
                  <>
                    <span className="inline-flex rounded-full bg-[#FFF3C4] px-2.5 py-0.5 text-xs font-medium text-[#8A6A00]">Unverified</span>
                    <button type="button" onClick={() => setVerifyEmailOpen(true)} className="text-sm font-semibold text-[#1F65FF] hover:underline cursor-pointer">Verify</button>
                  </>
                )}
              </p>
              {isOrganizer && (
                <p className="flex flex-wrap items-center gap-2 text-base text-[#4B4F52]">
                  Mobile: <span className="font-medium text-black">{savedPhone ? `+91 ${savedPhone}` : "Not added"}</span>
                  {savedPhone && phoneBadge}
                  {savedPhone && !user?.isPhoneVerified && user?.phoneVerificationAvailable && (
                    <button type="button" onClick={() => setPhoneOpen(true)} className="text-sm font-semibold text-[#1F65FF] hover:underline cursor-pointer">Verify</button>
                  )}
                </p>
              )}
              {isOrganizer && user?.verificationPending?.phone && !savedPhone && <p className="text-sm text-[#854D0E]">Add your mobile number with Edit Profile, then verify it here.</p>}
              {isOrganizer && <p className="text-base text-[#4B4F52]">Account type: <span className="font-medium text-black">{accountType}</span></p>}
              {isOrganizer && user?._id && <p className="text-base text-[#4B4F52]">Organizer ID: <span className="font-medium text-black">{formatOrganizerId(user._id)}</span></p>}
              <button type="button" onClick={() => setEditing(true)} className="mt-4 px-6 py-[11px] bg-[#1F65FF] hover:bg-[#1A56DB] rounded-lg text-base font-semibold text-white cursor-pointer">
                Edit Profile
              </button>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSave} className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg p-8 flex flex-col md:flex-row items-start gap-10">
            <AvatarSection
              avatarUrl={avatarUrl}
              fallbackUrl={avatarFallbackUrl}
              onAvatarChange={handleAvatarChange}
              onAvatarRemove={handleAvatarRemove}
              isUploading={isAvatarUploading}
            />
            <div className="flex-1 min-w-0 w-full space-y-4">
              <p className="text-[32px] leading-tight font-medium text-black break-words">{displayName}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                {/* Not in the frame, but renaming the account is an existing feature */}
                <div>
                  <label htmlFor="account-name" className="block text-sm font-medium text-[#15191C] mb-2">Account Name</label>
                  <input id="account-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={field} />
                </div>
                {/* the organizer's ID: shown for reference, never editable */}
                {isOrganizer && user?._id && (
                  <div>
                    <label htmlFor="account-organizer-id" className="block text-sm font-medium text-[#15191C] mb-2">Organizer ID</label>
                    <input id="account-organizer-id" type="text" value={formatOrganizerId(user._id)} readOnly title="Your organizer ID cannot be changed" className={`${field} text-[#6B6B6B] cursor-not-allowed`} />
                  </div>
                )}
                {isOrganizer && (
                  <div>
                    <span className="block text-sm font-medium text-[#15191C] mb-2">Account Type</span>
                    <CustomDropdown
                      value={chosenType || (accountType === "Organization" ? "ORGANIZATION" : accountType === "Individual" ? "INDIVIDUAL" : "")}
                      onChange={(v) => setChosenType(v as "INDIVIDUAL" | "ORGANIZATION")}
                      options={[{ value: "INDIVIDUAL", label: "Individual" }, { value: "ORGANIZATION", label: "Organization" }]}
                      placeholder="Choose the account type"
                      ariaLabel="Account type"
                    />
                  </div>
                )}
                {isOrganizer && (
                  <div>
                    <label htmlFor="account-phone" className="block text-sm font-medium text-[#15191C] mb-2">Mobile Number<span className="text-[#D92D20]">*</span></label>
                    <PhoneInput id="account-phone" required value={phone} onValueChange={setTypedPhone} placeholder="10-digit mobile number" className={field} />
                    {typedPhone !== null && typedPhone !== savedPhone && <p className="mt-1 text-xs text-[#6B6B6B]">A new number is unverified until you verify it.</p>}
                  </div>
                )}
                <div>
                  <label htmlFor="account-email" className="block text-sm font-medium text-[#15191C] mb-2">Email</label>
                  <div className="relative">
                    <input id="account-email" type="email" value={email} readOnly title={googleAccount ? "This account signs in with Google, so it keeps its Google address" : undefined} className={`${field} text-[#6B6B6B] ${isOrganizer && !googleAccount ? "pr-28" : "cursor-not-allowed"}`} />
                    {isOrganizer && !googleAccount && (
                      <button type="button" onClick={() => setEmailOpen(true)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#1F65FF] hover:underline cursor-pointer">
                        Change email
                      </button>
                    )}
                  </div>
                  {isOrganizer && googleAccount && <p className="mt-1 text-xs text-[#6B6B6B]">You sign in with Google, so this is your Google address.</p>}
                </div>
                <div>
                  <label htmlFor="account-password" className="block text-sm font-medium text-[#15191C] mb-2">Password</label>
                  <div className="relative">
                    <input id="account-password" type="password" value={password} readOnly className={`${field} pr-36`} />
                    <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#1F65FF] hover:underline cursor-pointer">
                      Change password
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="px-6 py-[11px] bg-[#1F65FF] hover:bg-[#1A56DB] rounded-lg text-base font-semibold text-white cursor-pointer">Save</button>
                <button type="button" onClick={() => { setEditing(false); setFullName(user?.fullName || ""); setChosenType(""); setTypedPhone(null); }} className="px-6 py-[11px] bg-white border border-[#E0E0E0] hover:bg-gray-50 rounded-lg text-base font-semibold text-[#15191C] cursor-pointer">Cancel</button>
              </div>
            </div>
          </form>
        )}

        {isOrganizer && !editing && <OrganisationDetailsForm />}
      </div>

      {emailOpen && (
        <ChangeEmailModal
          currentEmail={user?.email || ""}
          onClose={() => setEmailOpen(false)}
          onChanged={async (next) => {
            await refreshUser();
            setEmail(next);
            setEmailOpen(false);
            showAlert(`Your sign-in email is now ${next}.`, "success");
          }}
        />
      )}
      {verifyEmailOpen && (
        <VerifyEmailModal
          email={user?.email || ""}
          onClose={() => setVerifyEmailOpen(false)}
          onVerified={async () => {
            await refreshUser();
            setVerifyEmailOpen(false);
            showAlert("Your email address is verified.", "success");
          }}
        />
      )}
      {phoneOpen && (
        <VerifyPhoneModal
          phone={savedPhone}
          onClose={() => setPhoneOpen(false)}
          onVerified={async () => {
            await refreshUser();
            setPhoneOpen(false);
            showAlert("Your mobile number is verified.", "success");
          }}
        />
      )}

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onUpdate={handleUpdatePassword}
      />
    </div>
  );
}
