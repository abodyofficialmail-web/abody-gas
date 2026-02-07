import { getMember } from './sheets';

export async function authenticateMember(memberId: string, pin: string): Promise<{ success: boolean; member?: any }> {
  try {
    const member = await getMember(memberId);
    if (!member || !member.active || member.pin !== pin) return { success: false };
    return { success: true, member };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false };
  }
}
