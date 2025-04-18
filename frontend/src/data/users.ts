export interface User {
    username: string;
    xp: number;
    isFollowed: boolean;
  }
  
  export const users: User[] = [
    { username: 'peen', xp: 150, isFollowed: true },
    { username: 'peen2', xp: 120, isFollowed: false },
    { username: 'mario', xp: 200, isFollowed: true },
    { username: 'samus', xp: 175, isFollowed: false },
    { username: 'link', xp: 190, isFollowed: true },
    { username: 'zelda', xp: 180, isFollowed: false },
    { username: 'pikachu', xp: 165, isFollowed: true },
  ];
  