import React from "react";
import {
    View,
    ScrollView,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Image,
} from "react-native";
import { Bell } from "lucide-react-native";
import { Text as GluestackText } from "@/components/ui/text";
import type { ApiTeam } from "@/lib/api/teams";
import type { ApiClub } from "@/lib/api/clubs";

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

export function StepBottomBar({
    step,
    onBack,
    onNext,
    isLast,
}: {
    step: number;
    onBack: () => void;
    onNext: () => void;
    isLast: boolean;
}) {
    const progress = step / 3;
    return (
        <View style={styles.bottomBar}>
            <Pressable onPress={onBack} hitSlop={12}>
                <GluestackText className="font-lato text-[15px] font-medium text-typography-600">
                    Back
                </GluestackText>
            </Pressable>
            <View style={styles.progressTrack}>
                <View
                    style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
            </View>
            <Pressable onPress={onNext} style={styles.nextBtn}>
                <GluestackText className="font-lato text-white font-semibold text-base">
                    {isLast ? "Finish" : "Next"}
                </GluestackText>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
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
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 72,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        backgroundColor: "#FFFFFF",
    },
    progressTrack: {
        width: 120,
        height: 6,
        backgroundColor: "#E5E7EB",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#1A1A1A",
        borderRadius: 3,
    },
    nextBtn: {
        backgroundColor: "#1A1A1A",
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        justifyContent: "center",
        alignItems: "center",
    },
});
