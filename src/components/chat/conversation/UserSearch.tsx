"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage, userService } from "@/services";
import type { Guid, UserProfile } from "@/types";

interface UserSearchProps {
  label?: string;
  excludeUserIds?: Guid[];
  selectedUsers?: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onRemoveUser?: (userId: Guid) => void;
}

const UserSearch = ({
  label = "Search users",
  excludeUserIds = [],
  selectedUsers = [],
  onSelectUser,
  onRemoveUser,
}: UserSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      toast.error("Enter at least 2 characters to search.");
      return;
    }

    setIsSearching(true);
    try {
      const users = await userService.searchUsers(trimmedQuery);
      const excluded = new Set([
        ...excludeUserIds,
        ...selectedUsers.map((user) => user.id),
      ]);
      setResults(users.filter((user) => !excluded.has(user.id)));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to search users."));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="userSearch">
      <label className="fieldLabel">
        {label}
        <div className="searchRow">
          <input
            type="search"
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSearch();
              }
            }}
            placeholder="Name or email"
          />
          <button
            type="button"
            className="smallButton"
            onClick={() => void handleSearch()}
            disabled={isSearching}
          >
            {isSearching ? "..." : "Search"}
          </button>
        </div>
      </label>

      {selectedUsers.length > 0 && (
        <div className="selectedUserList">
          {selectedUsers.map((user) => (
            <span key={user.id} className="selectedUser">
              {user.fullName}
              {onRemoveUser && (
                <button
                  type="button"
                  className="inlineIconButton"
                  aria-label={`Remove ${user.fullName}`}
                  onClick={() => onRemoveUser(user.id)}
                >
                  x
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="searchResults">
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              className="searchResult"
              onClick={() => {
                onSelectUser(user);
                setQuery("");
                setResults([]);
              }}
            >
              <span>{user.fullName}</span>
              <span>{user.email}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
