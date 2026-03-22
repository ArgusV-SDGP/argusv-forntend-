"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authFetch,
  fetchMe,
  type AuthUser,
} from "@/lib/client-services/auth.service";

type UserRole = "ADMIN" | "VIEWER" | "OPERATOR";

type ManagedUser = {
  id: number | string;
  username: string;
  role: UserRole;
  is_active: boolean;
};

type ManagedUserApiResponse = {
  id?: number | string;
  user_id?: number | string;
  username: string;
  role: UserRole | string;
  is_active?: boolean;
};

const ROLE_OPTIONS: UserRole[] = ["ADMIN", "VIEWER", "OPERATOR"];

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function normalizeUser(user: ManagedUserApiResponse): ManagedUser {
  return {
    id: user.id ?? user.user_id ?? user.username,
    username: user.username,
    role: String(user.role).toUpperCase() as UserRole,
    is_active: user.is_active ?? true,
  };
}

async function getResponseError(
  response: Response,
  fallback: string
): Promise<string> {
  const data = (await response.json().catch(() => null)) as
    | { detail?: string; message?: string }
    | null;

  return data?.detail ?? data?.message ?? fallback;
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:border-[#18ffbe]/40 focus:outline-none focus:ring-2 focus:ring-[#18ffbe]/20";

const selectClass =
  "w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white/80 focus:border-[#18ffbe]/40 focus:outline-none focus:ring-2 focus:ring-[#18ffbe]/20 [&>option]:bg-[#111111] [&>option]:text-white/80";

export default function UserProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("VIEWER");
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | number | null>(
    null
  );

  async function loadUsers() {
    const response = await authFetch("/api/users");

    if (!response.ok) {
      throw new Error(await getResponseError(response, "Failed to load users"));
    }

    const data = (await response.json()) as ManagedUserApiResponse[];
    setUsers(data.map(normalizeUser));
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      try {
        const me = await fetchMe();

        if (me.role.toUpperCase() !== "ADMIN") {
          router.replace("/");
          return;
        }

        const response = await authFetch("/api/users");

        if (!response.ok) {
          throw new Error(await getResponseError(response, "Failed to load users"));
        }

        const data = (await response.json()) as ManagedUserApiResponse[];

        if (!cancelled) {
          setCurrentUser(me);
          setUsers(data.map(normalizeUser));
          setPageError("");
        }
      } catch (error) {
        if (!cancelled) {
          setPageError(getErrorMessage(error, "Failed to load admin profile"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");
    setIsCreating(true);

    try {
      const response = await authFetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role,
          is_active: isActive,
        }),
      });

      if (!response.ok) {
        throw new Error(await getResponseError(response, "Failed to create user"));
      }

      setUsername("");
      setPassword("");
      setRole("VIEWER");
      setIsActive(true);
      setFormSuccess("User created successfully");
      await loadUsers();
    } catch (error) {
      setFormError(getErrorMessage(error, "Failed to create user"));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRoleChange(userId: number | string, nextRole: UserRole) {
    if (!userId) {
      setPageError("User id is missing in the backend response");
      return;
    }

    setUpdatingUserId(userId);
    setPageError("");

    try {
      const response = await authFetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: nextRole }),
      });

      if (!response.ok) {
        throw new Error(await getResponseError(response, "Failed to update role"));
      }

      await loadUsers();
    } catch (error) {
      setPageError(getErrorMessage(error, "Failed to update role"));
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleStatusToggle(
    userId: number | string,
    nextStatus: boolean
  ) {
    if (!userId) {
      setPageError("User id is missing in the backend response");
      return;
    }

    setUpdatingUserId(userId);
    setPageError("");

    try {
      const response = await authFetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: nextStatus }),
      });

      if (!response.ok) {
        throw new Error(
          await getResponseError(response, "Failed to update status")
        );
      }

      await loadUsers();
    } catch (error) {
      setPageError(getErrorMessage(error, "Failed to update status"));
    } finally {
      setUpdatingUserId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#0a0a0a] p-8">
        <p className="text-sm text-white/40">Loading admin profile...</p>
      </main>
    );
  }

  if (currentUser?.role.toUpperCase() !== "ADMIN") {
    return null;
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section>
          <p className="text-sm font-medium text-[#18ffbe]">Admin Profile</p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            User Management
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Manage system users, change roles, and control access status.
          </p>
          {pageError ? (
            <p className="mt-4 text-sm text-red-400">{pageError}</p>
          ) : null}
        </section>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* Create user form */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white/80">
              Create User
            </h2>
            <form className="mt-5 space-y-4" onSubmit={handleCreateUser}>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/50">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={inputClass}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/50">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClass}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/50">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className={selectClass}
                >
                  {ROLE_OPTIONS.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {roleOption}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-3 text-sm text-white/50">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="size-4 rounded border-white/20 accent-[#18ffbe]"
                />
                Active user
              </label>
              {formError ? (
                <p className="text-sm text-red-400">{formError}</p>
              ) : null}
              {formSuccess ? (
                <p className="text-sm text-[#18ffbe]">{formSuccess}</p>
              ) : null}
              <button
                type="submit"
                disabled={isCreating}
                className="w-full rounded-lg bg-[#18ffbe] px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-[#18ffbe]/90 disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create User"}
              </button>
            </form>
          </div>

          {/* Users table */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden backdrop-blur-sm">
            <div className="border-b border-white/[0.06] px-6 py-4">
              <h2 className="text-lg font-semibold text-white/80">
                All Users
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/[0.06]">
                <thead className="bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/40">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/40">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/40">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-sm font-medium text-white/80">
                        {user.username}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          disabled={updatingUserId === user.id}
                          onChange={(event) =>
                            handleRoleChange(
                              user.id,
                              event.target.value as UserRole
                            )
                          }
                          className="rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-[#18ffbe]/30 disabled:opacity-50 [&>option]:bg-[#111111] [&>option]:text-white/80"
                        >
                          {ROLE_OPTIONS.map((roleOption) => (
                            <option key={roleOption} value={roleOption}>
                              {roleOption}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            user.is_active
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-white/[0.06] text-white/40 border border-white/10"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={updatingUserId === user.id}
                          onClick={() =>
                            handleStatusToggle(user.id, !user.is_active)
                          }
                          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white/80 disabled:opacity-50"
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-sm text-white/30"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
