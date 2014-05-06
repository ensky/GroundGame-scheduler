#include<stdlib.h>
#include<stdio.h>
#include<string.h>
#include<time.h>
#define MAX 32
int teamCount;
int levelCount;
int playTimes;
int map[MAX][MAX];
int colTeam[MAX]; 
int rowTeam[MAX];
int maxTeam;
int used[MAX][MAX];


int checkRowCol(int *rowTeam,int *colTeam,int p1, int p2){
	int temp;
	temp = 1 << p1;
	if( 0 != (*rowTeam & temp) )
		return 0;
	temp = 1 << p2;
	if( 0 != (*rowTeam & temp) )
		return 0;
	temp = 1 << p1;
	if( 0 != (*colTeam & temp) )
		return 0;
	temp = 1 << p2;
	if( 0 != (*colTeam & temp) )
		return 0;

	*rowTeam = *rowTeam | (1 << p1) | (1 << p2);
	*colTeam = *colTeam | (1 << p1) | (1 << p2);
	return 1;
}

void printAns(int ans){
	int count = 0;
	printf("|(");
	while(ans>0){
		if( (ans & 1)){
			if( count < teamCount)
				printf("%2d ",count);
			else
				printf("   ");
		}
		count ++;
		ans >>=1;
	}
	printf(")|");
}

void showAns(){
	int i,j;
	for( j=0 ; j <playTimes; j++){
			printf("----------");
	}
	printf("\n");
	for( i = 0; i < levelCount; i++){
		for( j =0 ; j < playTimes; j++){
			printAns(map[i][j]);
		}
		printf("\n");
		for( j=0 ; j <playTimes; j++){
			printf("----------");
		}
		printf("\n");
	}
}

int numberOfOne(int x){
	int count = 0;
	while(x>0){
		x = (x & (x-1));
		count++;
	}
	return count;
}

int generateInt(int input){
	int temp;
	while(1){
		temp = rand()% maxTeam;
		if(  !((input >> temp) & 1))
			return temp;
	}
}

void groundGame(int row,int col){
	int temp1,temp2;
	int team1,team2;
	int count = 0;
	int try[MAX][MAX];
	int i,j,rowOrCol,oneCount;
	if( (0 == row) &&  (playTimes == col) ){
		showAns();
		exit(0);
	}
	for(i=0;i<MAX;i++)
		for(j=0;j<MAX;j++)
			try[i][j]=0;
	rowOrCol = (rowTeam[row] | colTeam[col]) & (( 1<<maxTeam)-1);
	oneCount = numberOfOne(rowOrCol);
	count = (maxTeam-oneCount); // count = zeroCount
	count = count *  (count-1);
	if( 0 == count  ) {
		return ;
	}
	while(1){
		team1 = generateInt(rowOrCol);
		team2 = generateInt(rowOrCol);
		//printf("count:%d, x:%d y:%d,rowTeam:%d, colTeam:%d,c:%d, team1:%d, team2:%d\n",count,x,y,rowTeam[x],colTeam[y],c,team1,team2);
		if(count <=0)
			return ;
		//successful iff  
		//1. team1 != team2
		//2. team1 and team2 have been try in this round
		//3. team1 and team2 have not versued before.
		//4. team1 and team2 have not appeared in this colTeam (col)
		//5. team1 and team2 have not appeared in this rowTeam (row)

		//check condition 1
		if( (team1 >= teamCount) ^ (team2 >= teamCount)){
			if(!try[team1][team2]){
				try[team1][team2]  = try[team2][team1] =  1;
				count-=2;
			}
			continue;
		}
		if(team1 == team2 )
			continue ;
		//check condition 2
		if( try[team1][team2] || try[team2][team1] )
			continue;
		try[team1][team2]  = try[team2][team1] =  1;
		count -=2;
		//check condition 3
		if( (team1< teamCount) &&  used[team1][team2] | used[team2][team1])
			continue;
		//check condition 4 5 
		temp1 = rowTeam[row];
		temp2 = colTeam[col];
		if( 0 == checkRowCol(&rowTeam[row],&colTeam[col],team1,team2))
			continue;
		used[team1][team2] = used[team2][team1] = 1;
		map[row][col] = (1<<team1) | (1<<team2);
		if( (levelCount-1) == row)
			groundGame(0,col+1);
		else
			groundGame(row+1,col);
		used[team1][team2] = used[team2][team1] = 0;

		rowTeam[row] = temp1;
		colTeam[col] = temp2;
	}

}




int main(int argv,char** argc){
	int i,j;
	srand(time(0));
	if( 4 != argv){
		fprintf(stderr,"Usage: teamCount levelCount, playTimes\n");
		exit(1);
	}
	teamCount = strtol(argc[1],NULL,10);
	levelCount = strtol(argc[2],NULL,10);
	playTimes = strtol(argc[3],NULL,10);
	maxTeam = levelCount * 2;
	if( (teamCount < playTimes) ||  (teamCount > maxTeam) ){
		fprintf(stderr,"No solution!!\n");
		exit(1);
	}

	//initail a 2D array
	for( i = 0; i <levelCount ;i++){
		memset(map[i],0,playTimes);
	}
	for( i = 0; i < MAX;i++){
		colTeam[i]=0;
		rowTeam[i]=0;
	}

	groundGame(0,0);

}
