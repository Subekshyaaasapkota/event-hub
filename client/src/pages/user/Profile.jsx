import React, { useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Building2,
  Camera,
  Home,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getImageUrl } from "../../utils/imageUrl";
import { NEPAL_DISTRICTS } from "../../utils/districts";

const BIO_LIMIT = 250;

const fieldLabel = "mb-2 block text-sm font-medium text-stone-600";
const fieldInput =
  "w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-[15px] text-ink placeholder:text-stone-400 outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/15";

// Defined at module scope: creating it inside Profile would remount every row
// on each render, and the lint rule catches it.
const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 py-4">
    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-hairline bg-white text-stone-500">
      <Icon size={17} aria-hidden="true" />
    </div>
    <div className="min-w-0 flex-1">
      <dt className="text-sm text-stone-500">{label}</dt>
      <dd className="mt-0.5 break-words text-[15px] font-medium text-ink">
        {value || <span className="font-normal text-stone-400">Not added yet</span>}
      </dd>
    </div>
  </div>
);

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [editData, setEditData] = useState({
    name: "",
    address: "",
    district: "",
    college: "",
    bio: "",
    interestedSkills: [],
  });

  // Re-seed whenever the loaded user changes, so the form always opens on the
  // saved values instead of whatever was typed last time.
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      setEditData({
        name: user.name || "",
        address: user.address || "",
        district: user.district || "",
        college: user.college || "",
        bio: user.bio || "",
        interestedSkills: user.interestedSkills || [],
      });
      setPreviewImage(user.profilePicture ? getImageUrl(user.profilePicture) : null);
    }
  }

  // A district saved before the list was updated, or typed in earlier, still
  // has to stay selectable. Without this, opening the page would quietly offer
  // a different value and saving would overwrite it.
  const districtGroups = useMemo(() => {
    const known = new Set(Object.values(NEPAL_DISTRICTS).flat());
    const current = user?.district;
    if (current && !known.has(current)) {
      return { ...NEPAL_DISTRICTS, Elsewhere: [current] };
    }
    return NEPAL_DISTRICTS;
  }, [user?.district]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill) return;
    if (editData.interestedSkills.includes(skill)) {
      toast.error("That skill is already on your list.");
      return;
    }
    setEditData((prev) => ({
      ...prev,
      interestedSkills: [...prev.interestedSkills, skill],
    }));
    setNewSkill("");
  };

  const removeSkill = (skill) => {
    setEditData((prev) => ({
      ...prev,
      interestedSkills: prev.interestedSkills.filter((item) => item !== skill),
    }));
  };

  const handleSave = async () => {
    const trimmed = {
      ...editData,
      name: editData.name.trim(),
      college: editData.college.trim(),
      address: editData.address.trim(),
      district: editData.district,
      bio: editData.bio.trim(),
      interestedSkills: editData.interestedSkills.map((skill) => skill.trim()),
    };

    if (!trimmed.name) {
      toast.error("Your name cannot be empty.");
      return;
    }

    const formData = new FormData();
    Object.keys(trimmed).forEach((key) => {
      if (key === "interestedSkills") {
        formData.append(key, JSON.stringify(trimmed[key]));
      } else {
        formData.append(key, trimmed[key]);
      }
    });

    if (selectedFile) formData.append("profilePicture", selectedFile);

    const res = await updateProfile(formData);
    if (res.success) {
      setIsEditing(false);
      setSelectedFile(null);
      toast.success("Profile updated.");
    } else {
      toast.error(res.message);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setNewSkill("");
    setSelectedFile(null);
    setPreviewImage(user?.profilePicture ? getImageUrl(user.profilePicture) : null);
  };

const displaySkills = isEditing ? editData.interestedSkills : user?.interestedSkills || [];
  const bioLength = (isEditing ? editData.bio : user?.bio || "").length;

  return (

    <>
      <header className="flex flex-col gap-6 border-b border-hairline pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Profile
          </h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-stone-600">
            These details travel with your registrations. Keep them accurate so
            organisers know who they are admitting.
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="press inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3.5 font-semibold text-paper transition-colors duration-200 hover:bg-stone-800"
          >
            <Pencil size={16} aria-hidden="true" />
            Edit profile
          </button>
        ) : null}
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[19rem_1fr]">
        {/* Identity */}
        <section className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-3xl border border-hairline bg-white p-6">
            <div className="flex items-center gap-4">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-ink font-display text-3xl font-semibold text-paper"
                >
                  {user?.name?.trim().charAt(0).toUpperCase() || "?"}
                </div>
              )}

              <div className="min-w-0">
                <h2 className="truncate font-display text-xl font-semibold tracking-tight text-ink">
                  {user?.name || "Your name"}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-stone-500">
                  <Mail size={14} aria-hidden="true" />
                  {user?.email}
                </p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="sr-only"
              onChange={handleFileChange}
              accept="image/*"
              tabIndex={-1}
            />

            {isEditing ? (
              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="press inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-hairline bg-white px-5 py-3 text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-50"
                >
                  <Camera size={16} aria-hidden="true" />
                  Change photo
                </button>
                <p className="text-center text-xs text-stone-500">
                  {selectedFile ? selectedFile.name : "JPG or PNG, up to 5 MB."}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <div className="space-y-8">
          {/* Details */}
          <section className="rounded-3xl border border-hairline bg-white p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
              Details
            </h3>

            {isEditing ? (
              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="profile-name" className={fieldLabel}>
                    Full name
                  </label>
                  <input
                    id="profile-name"
                    name="name"
                    type="text"
                    value={editData.name}
                    onChange={handleInputChange}
                    className={fieldInput}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="profile-college" className={fieldLabel}>
                    College or institution
                  </label>
                  <input
                    id="profile-college"
                    name="college"
                    type="text"
                    value={editData.college}
                    onChange={handleInputChange}
                    className={fieldInput}
                    placeholder="e.g. Pulchowk Campus"
                  />
                </div>

                <div>
                  <label htmlFor="profile-district" className={fieldLabel}>
                    District
                  </label>
                  <select
                    id="profile-district"
                    name="district"
                    value={editData.district}
                    onChange={handleInputChange}
                    className={fieldInput}
                  >
                    <option value="">Select a district</option>
                    {Object.entries(districtGroups).map(([province, districts]) => (
                      <optgroup key={province} label={province}>
                        {districts.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="profile-address" className={fieldLabel}>
                    Address
                  </label>
                  <input
                    id="profile-address"
                    name="address"
                    type="text"
                    value={editData.address}
                    onChange={handleInputChange}
                    className={fieldInput}
                    placeholder="Street, municipality"
                    autoComplete="street-address"
                  />
                </div>

                <p className="text-xs text-stone-500">
                  Your email address is used to sign in and cannot be changed here.
                </p>
              </div>
            ) : (
              <dl className="mt-2 divide-y divide-hairline">
                <DetailRow
                  icon={Mail}
                  label="Email"
                  value={user?.email}
                />
                <DetailRow
                  icon={Building2}
                  label="College or institution"
                  value={user?.college}
                />
                <DetailRow
                  icon={MapPin}
                  label="District"
                  value={user?.district}
                />
                <DetailRow
                  icon={Home}
                  label="Address"
                  value={user?.address}
                />
              </dl>
            )}
          </section>

          {/* Bio */}
          <section className="rounded-3xl border border-hairline bg-white p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                About you
              </h3>
              {bioLength > 0 ? (
                <span className="shrink-0 text-xs tabular-nums text-stone-400">
                  {bioLength}/{BIO_LIMIT}
                </span>
              ) : null}
            </div>

            {isEditing ? (
              <div className="mt-6">
                <label htmlFor="profile-bio" className="sr-only">
                  About you
                </label>
                <textarea
                  id="profile-bio"
                  name="bio"
                  rows={4}
                  maxLength={BIO_LIMIT}
                  value={editData.bio}
                  onChange={handleInputChange}
                  className={`${fieldInput} resize-y`}
                  placeholder="A sentence or two about what you are into."
                />
              </div>
            ) : (
              <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-stone-600">
                {user?.bio || (
                  <span className="text-stone-400">
                    Nothing written yet.
                  </span>
                )}
              </p>
            )}
          </section>

          {/* Skills */}
          <section className="rounded-3xl border border-hairline bg-white p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
              Skills
            </h3>

            {displaySkills.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {displaySkills.map((skill) => (
                  <li
                    key={skill}
                    className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper py-2 pl-4 pr-2 text-sm text-ink"
                  >
                    {skill}
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill}`}
                        className="press flex h-7 w-7 items-center justify-center rounded-full text-stone-400 transition-colors duration-200 hover:bg-stone-200 hover:text-ink"
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[15px] text-stone-400">
                No skills added yet.
              </p>
            )}

            {isEditing ? (
              <div className="mt-5 flex gap-3">
                <label htmlFor="profile-skill" className="sr-only">
                  Add a skill
                </label>
                <input
                  id="profile-skill"
                  type="text"
                  value={newSkill}
                  onChange={(event) => setNewSkill(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addSkill();
                    }
                  }}
                  className={fieldInput}
                  placeholder="e.g. Python"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="press inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-hairline bg-white px-5 font-medium text-ink transition-colors duration-200 hover:bg-stone-50"
                >
                  <Plus size={16} aria-hidden="true" />
                  Add
                </button>
              </div>
            ) : null}
          </section>

          {isEditing ? (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={loading}
                className="press inline-flex items-center justify-center rounded-2xl px-6 py-3.5 font-medium text-stone-600 transition-colors duration-200 hover:bg-stone-200 hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="press inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3.5 font-semibold text-paper transition-colors duration-200 hover:bg-stone-800 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Saving
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Profile;
