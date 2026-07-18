import {
  Mic, Trophy, Calendar, Bell, Star, Heart, BookOpen, Target, Lightbulb,
  Megaphone, GraduationCap, Camera, ClipboardList, FileText, Users,
  MessageSquare, ThumbsUp, Award, Flag, Gift, Vote, Info, Link2,
  SquareCheck, Zap, CalendarDays, Mail, Phone, MapPin, Clock,
  type LucideIcon,
} from "lucide-react";

export const CLUB_ICON_MAP: Record<string, LucideIcon> = {
  Mic, Trophy, Calendar, Bell, Star, Heart, BookOpen, Target, Lightbulb,
  Megaphone, GraduationCap, Camera, ClipboardList, FileText, Users,
  MessageSquare, ThumbsUp, Award, Flag, Gift, Vote, Info, Link2,
  SquareCheck, Zap, CalendarDays, Mail, Phone, MapPin, Clock,
};

export const CLUB_ICON_KEYS = Object.keys(CLUB_ICON_MAP);

export function getClubIcon(key: string | undefined | null): LucideIcon {
  return (key && CLUB_ICON_MAP[key]) || Vote;
}
