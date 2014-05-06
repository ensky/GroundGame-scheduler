#include<stdlib.h>
#include<stdio.h>
#include<string.h>
#include<time.h>
#define MAX 32
int teamCount;  //隊伍數量，必須是二的倍數
int levelCount; //關卡數量，必須比 隊伍人數的一半還多，否則會有隊伍沒有關卡可以玩
int maxTeam;	   //代表所有隊伍數量，此值由 (隊伍數量 + 空白隊伍) 所組成， 若 關卡數量比 (隊伍數量/2) 還要多，代表同時間有一些關卡是沒有人隊伍的，這些空的隊伍就用後面的bit來使用
int playTimes;  //每個隊伍要玩幾個關卡(換句話說就是每個關卡最多遇到幾個隊伍)， 此值必須要  小於等於 所有隊伍(maxTeam)的一半，
/*
	目前的版本只能支援最多32的隊伍，因為使用bit運算的結果，使用int做為儲存容器，每個bit代表一個隊伍

*/
int map[MAX][MAX]; //用來存放結果的，假設回合是team 3 vs. team6, 那此值就是 01001000
int colTeam[MAX];  //同個時間，每個隊伍只能出現在一個關卡，用一個整數記錄當前時間哪些隊伍已經玩過了，依然使用bit
int rowTeam[MAX];  //每個隊伍隊於相同關卡只能玩一次， 用一個整數記錄每個關卡目前有哪些隊伍已經玩過了，依然使用bit
				   //i.e  隊伍數量:8 關卡數量:5 則每個時間內，會有四組對戰，但是有五個關卡，因此有ㄧ個關卡會沒有隊伍，因此總共會用到10個bit, 前面8個bit代表隊伍1~8 ,後面兩個bit代表空的隊伍
int used[MAX][MAX];//用來記錄哪些隊伍 已經比較過了




//  rowTeam: 記錄者某一個關卡目前已經遊玩的隊伍
//  colTeam: 記錄者當前回合已經有配對成功的隊伍
//  給與兩個隊伍的編號(n1,n2)，判斷這兩個隊伍是否能夠隊決
//  若是能夠對決，就加入到 rowTeam 跟 colTeam的記錄中
int checkRowCol(int *rowTeam,int *colTeam,int n1, int n2){
	int temp;
	temp = 1 << n1;
	if( 0 != (*rowTeam & temp) )
		return 0;
	temp = 1 << n2;
	if( 0 != (*rowTeam & temp) )
		return 0;
	temp = 1 << n1;
	if( 0 != (*colTeam & temp) )
		return 0;
	temp = 1 << n2;
	if( 0 != (*colTeam & temp) )
		return 0;

	*rowTeam = *rowTeam | (1 << n1) | (1 << n2);
	*colTeam = *colTeam | (1 << n1) | (1 << n2);
	return 1;
}

// 列印結果，把 100100 轉化成 (3,6) 兩個隊伍的對決
// 如果此值比隊伍數量還大，就代表是空隊伍的對決，因此輸出空白即可

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

//輸出整個陣列結果，對於每一個欄位都呼叫 printAns把數字轉成隊伍

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


// 計算一個32-bit的數字有幾個bit是1
int numberOfOne(int x){
	int count = 0;
	while(x>0){
		x = (x & (x-1));
		count++;
	}
	return count;
}

//給定一個input, 從該input的二進位表達中去隨機挑出一個bit是0的位置
//i.e 假如input是 1101001 那是零的位置有(1,2,4),所以此function會隨機回傳 1,2,4其中一個
//利用maxTeam來控制範圍是落在哪些bit內，因為maxTeam代表所有隊伍數量(實際隊伍+空白隊伍)
int generateInt(int input){
	int temp;
	while(1){
		temp = rand()% maxTeam;
		if(  !((input >> temp) & 1))
			return temp;
	}
}

// row,col 代表當前要嘗試的數字所位在的位置
// row: 第幾個關卡
// col: 第幾個回合
//
void groundGame(int row,int col){
	int temp1,temp2;
	int team1,team2;
	int count = 0;
	int try[MAX][MAX]; //記錄當前回合中，已經測試過哪些組合
	int i,j,rowOrCol,oneCount;

	//如果col的數量已經超過規定了，就代表跑出結果了，把結果列印出來並結束process
	if( (0 == row) &&  (playTimes == col) ){
		showAns();
		exit(0);
	}
	//初始化 
	for(i=0;i<MAX;i++)
		for(j=0;j<MAX;j++)
			try[i][j]=0;

	//rowTeam跟colTeam分別代表 該關卡已經遊玩過的隊伍 以及 該時段已經遊玩過的隊伍
	//所以我們要挑選的隊伍必須不能在該rowTeam跟colTeam出現過，因此我們先把兩個數字結合
	rowOrCol = (rowTeam[row] | colTeam[col]) & (( 1<<maxTeam)-1);
	//接下來想要計算這個回合有多少總可能性需要嘗試
	//先記錄總共有多少個1
	oneCount = numberOfOne(rowOrCol);
	//1代表已經玩過了，所以我們用相減的方式得到有多少個0，代表有多少個隊伍可以嘗試
	count = (maxTeam-oneCount); 
	//有n個隊伍，會有 n * (n-1)總可能性， 這邊排除 兩次都挑到同個隊伍的可能性
	count = count *  (count-1);
	//如果沒有任何可能，就直接離開這回合
	if( 0 == count  ) {
		return ;
	}
	while(1){
		//用剛剛合並得到的值來隨機產生一個bit是0的編號隊伍
		team1 = generateInt(rowOrCol);
		team2 = generateInt(rowOrCol);
		//如果已經沒有任何可能，就直接離開這回合
		if(count <=0)
			return ;
		//因此若是有ㄧ個挑出來的編號比teamCount還要大，就代表選擇的是空白隊伍,
		//因為空白隊伍只能跟空白隊伍隊決，所以若是另外一個數字不是空白隊伍，那就記錄一下這個組合使用過，並且重新挑數字
		if( (team1 >= teamCount) ^ (team2 >= teamCount)){
			if(!try[team1][team2]){
				try[team1][team2]  = try[team2][team1] =  1; // 6 v 7  === 7 v 6, 所以count一次扣二
				count-=2;
			}
			continue;
		}

		//成功的挑選必須要滿足下列條件
		//1. team1 != team2
		if(team1 == team2 )
			continue ;
		//2. team1 跟 team2 是該回合第一次嘗試
		//
		//若是第一次嘗試，就記錄一下嘗試過，並且把 count(還有多少種可能性)的值給減二，因為1v2 == 2v1
		if( try[team1][team2] || try[team2][team1] )
			continue;
		else{
			try[team1][team2]  = try[team2][team1] =  1;
			count -=2;
		}
		//3. team1 跟 team2 以前沒有對決過
		//只有不是空白隊伍才需要"計較"以前有沒有對決過
		if( (team1< teamCount) &&  used[team1][team2] | used[team2][team1])
			continue;
		//4. team1 跟 team2 在該回合還沒有玩過 colTeam 
		//5. team1 跟 team2 在該關卡還沒有玩過 rowTeam
		//
		//先記錄本來的row跟col的值，遞迴 結束後要復原
		temp1 = rowTeam[row];
		temp2 = colTeam[col];
		if( 0 == checkRowCol(&rowTeam[row],&colTeam[col],team1,team2))
			continue;
		//通過測是，使用這一組對決
		//記錄這兩組曾經PK過
		used[team1][team2] = used[team2][team1] = 1;
		//記錄這兩組在col回合於row隊決，結果要用
		map[row][col] = (1<<team1) | (1<<team2);
		//如果已經是該回合的最後一個關卡，就往下一個回合去嘗試
		if( (levelCount-1) == row)
			groundGame(0,col+1);
		else
			groundGame(row+1,col);

		//遞迴結束後復原
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
	maxTeam = levelCount * 2; //maxTeam的數量就是關卡數量的兩倍， 如果這個值比隊伍數量大，那後面的bit就是空白隊伍，如果此值等於隊伍數量，代表沒有空白隊伍
	if( (teamCount&1) || ( (maxTeam/2) < playTimes) ||  (teamCount > maxTeam) ){
		fprintf(stderr,"No solution!!\n");
		exit(1);
	}

	//初始化相關陣列
	for( i = 0; i <levelCount ;i++){
		memset(map[i],0,playTimes);
	}
	for( i = 0; i < MAX;i++){
		colTeam[i]=0;
		rowTeam[i]=0;
	}
	//從row:0 col:0 開始跑
	groundGame(0,0);

}
