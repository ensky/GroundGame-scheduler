onmessage = function (oEvent) {
    var data = JSON.parse(oEvent.data);
    Round(data);
};

var map = [],
    colTeam = [],
    rowTeam = [],
    used = [],
    MAX = 32,
    teamCount,
    levelCount,
    maxTeam,
    playTimes;

var Round = function (conf) {
    teamCount = parseInt(conf.team)
    levelCount = parseInt(conf.check)
    playTimes = parseInt(conf.round)
    
    maxTeam = levelCount * 2; //maxTeam的數量就是關卡數量的兩倍， 如果這個值比隊伍數量大，那後面的bit就是空白隊伍，如果此值等於隊伍數量，代表沒有空白隊伍
    var i;
    if( (teamCount&1) || ( (maxTeam/2) < playTimes) ||  (teamCount > maxTeam) ){
        postResult(false);
    } else {
        initArray(map, levelCount, playTimes, 0)
        initArray(used, MAX, MAX, 0);
        for( i = 0; i < MAX; i++){
            colTeam.push(0);
            rowTeam.push(0);
        }

        //從row:0 col:0 開始跑
        groundGame(0,0);
    }
}

var postResult = function (isCorrect) {

    // 列印結果，把 100100 轉化成 (3,6) 兩個隊伍的對決
    // 如果此值比隊伍數量還大，就代表是空隊伍的對決，因此輸出空白即可
    var printAns = function (ans) {
        var count = 0,
            result = [];
        while(ans>0){
            if( (ans & 1)){
                if( count < teamCount)
                    result.push(count);
                else
                    result.push('');
            }
            count ++;
            ans >>=1;
        }
        return result;
    }

    //輸出整個陣列結果，對於每一個欄位都呼叫 printAns把數字轉成隊伍
    var showAns = function () {
        var i, j, result = {};
        for( i = 0; i < levelCount; i++){
            for ( j = 0 ; j < playTimes; j++) {
                if (result[j+1] === undefined)
                    result[j+1] = {}
                result[j+1][i+1] = printAns(map[i][j]);
            }
        }
        return result;
    }
    var result = isCorrect ? showAns() : [];
    postMessage(JSON.stringify([isCorrect, result]));
}

var initArray = function (array, row, col, value) {
   for (var i = 0; i < row; i++) {
      array[i] = [];
      for (var j = 0; j < col; j++) {
          array[i][j] = value;
      }
   }
}

var groundGame = function (row, col) {
    var temp1,temp2;
    var team1,team2;
    var count = 0;
    var tried = []; //記錄當前回合中，已經測試過哪些組合
    var i, j, rowOrCol, oneCount;

    //如果col的數量已經超過規定了，就代表跑出結果了，把結果列印出來並結束process
    if( (0 == row) && (playTimes == col) ){
        postResult(true);
        return true;
    }
    
    initArray(tried, MAX, MAX, 0);

    //rowTeam跟colTeam分別代表 該關卡已經遊玩過的隊伍 以及 該時段已經遊玩過的隊伍
    //所以我們要挑選的隊伍必須不能在該rowTeam跟colTeam出現過，因此我們先把兩個數字結合
    rowOrCol = (rowTeam[row] | colTeam[col]) & (( 1<<maxTeam)-1);
    //接下來想要計算這個回合有多少總可能性需要嘗試
    //先記錄總共有多少個1
    oneCount = numberOfOne(rowOrCol);
    //1代表已經玩過了，所以我們用相減的方式得到有多少個0，代表有多少個隊伍可以嘗試
    count = (maxTeam-oneCount); 
    //有n個隊伍，會有 n * (n-1)總可能性， 這邊排除 兩次都挑到同個隊伍的可能性
    count = count * (count-1);
    //如果沒有任何可能，就直接離開這回合
    if( 0 == count  ) {
        return false;
    }
    while (true) {
        //用剛剛合並得到的值來隨機產生一個bit是0的編號隊伍
        team1 = generateInt(rowOrCol);
        team2 = generateInt(rowOrCol);

        //如果已經沒有任何可能，就直接離開這回合
        if(count <=0)
            return false;
        //因此若是有ㄧ個挑出來的編號比teamCount還要大，就代表選擇的是空白隊伍,
        //因為空白隊伍只能跟空白隊伍隊決，所以若是另外一個數字不是空白隊伍，那就記錄一下這個組合使用過，並且重新挑數字
        if( (team1 >= teamCount) ^ (team2 >= teamCount)){
            if(!tried[team1][team2]){
                tried[team1][team2]  = tried[team2][team1] =  1; // 6 v 7  === 7 v 6, 所以count一次扣二
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
        if( tried[team1][team2] || tried[team2][team1] )
            continue;
        else{
            tried[team1][team2]  = tried[team2][team1] =  1;
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
        var rowColResult;
        if( false === (rowColResult = checkRowCol(rowTeam[row],colTeam[col],team1,team2)) )
            continue;
        rowTeam[row] = rowColResult[0]
        colTeam[col] = rowColResult[1]
        //通過測是，使用這一組對決
        //記錄這兩組曾經PK過
        used[team1][team2] = used[team2][team1] = 1;
        //記錄這兩組在col回合於row隊決，結果要用
        map[row][col] = (1<<team1) | (1<<team2);
        //如果已經是該回合的最後一個關卡，就往下一個回合去嘗試

        var result = (levelCount-1) == row ? 
            groundGame(0,col+1) : 
            groundGame(row+1,col);
        if (result)
            return true;

        //遞迴結束後復原
        used[team1][team2] = used[team2][team1] = 0;
        rowTeam[row] = temp1;
        colTeam[col] = temp2;
    }
}

//  rowTeam: 記錄者某一個關卡目前已經遊玩的隊伍
//  colTeam: 記錄者當前回合已經有配對成功的隊伍
//  給與兩個隊伍的編號(n1,n2)，判斷這兩個隊伍是否能夠隊決
//  若是能夠對決，就加入到 rowTeam 跟 colTeam的記錄中
var checkRowCol = function (rowTeamRow, colTeamCol, n1, n2) {
    var temp;

    temp = 1 << n1
    if ( 0 != (rowTeamRow & temp) )
        return false
    temp = 1 << n2
    if ( 0 != (rowTeamRow & temp) )
        return false
    temp = 1 << n1
    if ( 0 != (colTeamCol & temp) )
        return false
    temp = 1 << n2
    if ( 0 != (colTeamCol & temp) )
        return false

    rowTeamRow = rowTeamRow | (1 << n1) | (1 << n2)
    colTeamCol = colTeamCol | (1 << n1) | (1 << n2)
    return [rowTeamRow, colTeamCol];
}

// 計算一個32-bit的數字有幾個bit是1
var numberOfOne = function (x) {
    var count = 0;
    while (x > 0) {
        x = (x & (x-1));
        count++;
    }
    return count;
}

//給定一個input, 從該input的二進位表達中去隨機挑出一個bit是0的位置
//i.e 假如input是 1101001 那是零的位置有(1,2,4),所以此function會隨機回傳 1,2,4其中一個
//利用maxTeam來控制範圍是落在哪些bit內，因為maxTeam代表所有隊伍數量(實際隊伍+空白隊伍)
var generateInt = function (input) {
    var temp;
    while (true) {
        temp = rand(0, maxTeam)
        if ( !((input >> temp) & 1) )
            return temp;
    }
}

var rand = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}