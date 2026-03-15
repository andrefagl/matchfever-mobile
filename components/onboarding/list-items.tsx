import React from "react";
import {
    View,
    Pressable,
    StyleSheet,
    Image,
} from "react-native";
import { Bell } from "lucide-react-native";
import { Text as GluestackText } from "@/components/ui/text";
import type { ApiPlayer } from "@/lib/api/players";
import type { ApiTeam } from "@/lib/api/teams";
import type { ApiClub } from "@/lib/api/clubs";

export function formatPlayerDisplayName(player: ApiPlayer): string {
    if (player.firstName && player.lastName) {
        const lastParts = player.lastName.trim().split(/\s+/).filter(Boolean);
        const last = lastParts[lastParts.length - 1] ?? player.lastName;
        return `${player.firstName} ${last}`;
    }
    const parts = (player.name ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 2) return player.name ?? "";
    return `${parts[0]} ${parts[parts.length - 1]}`;
}

export function formatTeamDisplayName(team: ApiTeam, clubs: ApiClub[]): string {
    const clubMap = new Map(clubs.map((c) => [c.id, c]));
    if (team.name?.includes(" - ")) return team.name;
    if (team.clubId) {
        const club = clubMap.get(team.clubId);
        const clubName = club?.name ?? club?.shortName ?? "";
        const escalao = team.escalao ?? team.name;
        if (clubName) return `${clubName} - ${escalao}`;
    }
    return team.name ?? team.acronym ?? "";
}

export function PlayerAvatar({ avatarUrl }: { avatarUrl?: string | null }) {
    if (avatarUrl) {
        return (
            <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                resizeMode="cover"
            />
        );
    }
    return <View style={styles.avatar} />;
}

export function TeamAvatar({ logoUrl }: { logoUrl?: string | null }) {
    if (logoUrl) {
        return (
            <Image
                source={{ uri: logoUrl }}
                style={styles.avatar}
                resizeMode="cover"
            />
        );
    }
    return <View style={styles.avatar} />;
}

export function FollowButton({
    id,
    following,
    onToggle,
}: {
    id: string;
    following: boolean;
    onToggle: (id: string) => void;
}) {
    return (
        <Pressable
            onPress={() => onToggle(id)}
            style={[
                styles.followBtn,
                following ? styles.followBtnActive : styles.followBtnOutline,
            ]}
        >
            <GluestackText
                className={
                    following
                        ? "font-lato text-white font-semibold text-[13px]"
                        : "font-lato text-typography-900 font-semibold text-[13px]"
                }
            >
                {following ? "Following" : "Follow"}
            </GluestackText>
            {following && <Bell size={14} color="#FFFFFF" />}
        </Pressable>
    );
}

export function ClubListItem({
    item,
    followedIds,
    onToggleFollow,
}: {
    item: ApiClub;
    followedIds: Set<string>;
    onToggleFollow: (id: string) => void;
}) {
    return (
        <View style={styles.listItem}>
            <View style={styles.listItemLeft}>
                <TeamAvatar logoUrl={item.logo} />
                <GluestackText className="font-lato text-[15px] font-semibold text-typography-900">
                    {item.name}
                </GluestackText>
            </View>
            <FollowButton
                id={item.id}
                following={followedIds.has(item.id)}
                onToggle={onToggleFollow}
            />
        </View>
    );
}

export function TeamListItem({
    item,
    clubs,
    followedIds,
    onToggleFollow,
}: {
    item: ApiTeam;
    clubs: ApiClub[];
    followedIds: Set<string>;
    onToggleFollow: (id: string) => void;
}) {
    return (
        <View style={styles.listItem}>
            <View style={styles.listItemLeft}>
                <TeamAvatar logoUrl={item.logo} />
                <View>
                    <GluestackText className="font-lato text-[15px] font-semibold text-typography-900">
                        {formatTeamDisplayName(item, clubs)}
                    </GluestackText>
                    {item.acronym && (
                        <GluestackText className="font-lato text-[13px] font-medium text-typography-500">
                            {item.acronym}
                        </GluestackText>
                    )}
                </View>
            </View>
            <FollowButton
                id={item.id}
                following={followedIds.has(item.id)}
                onToggle={onToggleFollow}
            />
        </View>
    );
}

export function PlayerListItem({
    item,
    followedIds,
    onToggleFollow,
}: {
    item: ApiPlayer;
    followedIds: Set<string>;
    onToggleFollow: (id: string) => void;
}) {
    return (
        <View style={styles.listItem}>
            <View style={[styles.listItemLeft, { flex: 1, minWidth: 0 }]}>
                <PlayerAvatar avatarUrl={item.avatarUrl} />
                <GluestackText
                    className="font-lato text-[15px] font-semibold text-typography-900"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {formatPlayerDisplayName(item)}
                </GluestackText>
            </View>
            <FollowButton
                id={item.id}
                following={followedIds.has(item.id)}
                onToggle={onToggleFollow}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F6F7F8",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    listItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
    },
    followBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    followBtnOutline: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#1A1A1A",
    },
    followBtnActive: {
        backgroundColor: "#1A1A1A",
    },
});
