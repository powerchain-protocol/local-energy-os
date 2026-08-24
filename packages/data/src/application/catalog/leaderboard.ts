export type LeaderboardCategory="prosumer"|"consumer"|"partner"|"depin";
export type LeaderboardEntry={id:string;rank:number;name:string;category:LeaderboardCategory;region:string;energyScore:number;carbonScore:number;networkScore:number;reputation:number;rewardWpwrc:number;change:number};
export const leaderboard:LeaderboardEntry[]=[
{id:"lb-001",rank:1,name:"NorthGrid Cooperative",category:"prosumer",region:"Finland",energyScore:982,carbonScore:946,networkScore:908,reputation:971,rewardWpwrc:184200,change:2},
{id:"lb-002",rank:2,name:"Helio Community Energy",category:"partner",region:"Spain",energyScore:951,carbonScore:974,networkScore:899,reputation:958,rewardWpwrc:161800,change:-1},
{id:"lb-003",rank:3,name:"Arctic Meter Validators",category:"depin",region:"Norway",energyScore:890,carbonScore:872,networkScore:993,reputation:949,rewardWpwrc:154400,change:1},
{id:"lb-004",rank:4,name:"GreenBlock Residents",category:"consumer",region:"Netherlands",energyScore:821,carbonScore:938,networkScore:846,reputation:912,rewardWpwrc:98200,change:3},
{id:"lb-005",rank:5,name:"Baltic Wind Portfolio",category:"prosumer",region:"Estonia",energyScore:929,carbonScore:918,networkScore:861,reputation:905,rewardWpwrc:91200,change:-2},
];
