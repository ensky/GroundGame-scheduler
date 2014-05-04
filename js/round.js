function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

Array.range= function(a, b, step){
    var A= [];
    if(typeof a== 'number'){
        A[0]= a;
        step= step || 1;
        while(a+step<= b){
            A[A.length]= a+= step;
        }
    }
    else{
        var s= 'abcdefghijklmnopqrstuvwxyz';
        if(a=== a.toUpperCase()){
            b=b.toUpperCase();
            s= s.toUpperCase();
        }
        s= s.substring(s.indexOf(a), s.indexOf(b)+ 1);
        A= s.split('');        
    }
    return A;
}
var rand = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var shuffle = function (array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}
var randomPick = function (max, pick) {
    var a = {},
        n;
    do {
        n = rand(1, max);
        if ( a[n] === undefined ) {
            a.push(n)
        }
    } while ( a.length < pick);
    return a;
}
var randomArray = function (n) {
    return shuffle(Array.range(1, n));
}

var Checker = function (teams) {
    var vs = {},
        played = {},
        tplayed = {},
        pub = {}

    for (var i = 1; i <= teams; i++) {
        vs[i] = {}
        played[i] = {}
    }

    pub.new_level = function () {
        tplayed = {}
    }

    pub.vs = function (a, b) {
        vs[a][b] = true
        vs[b][a] = true
    }

    pub.nvs = function (a, b) {
        delete(vs[a][b])
        delete(vs[b][a])
    }

    pub.vsed = function (a, b) {
        return vs[a] && vs[a][b]
    }

    pub.play = function (team, check) {
        played[team][check] = true
        tplayed[team] = true
    }

    pub.nplay = function (team, check) {
        delete played[team][check]
        delete tplayed[team]
    }

    pub.played = function (team, check) {
        return (played[team] && played[team][check] !== undefined) || tplayed[team] !== undefined
    }

    return pub;
}

var Round = function (conf) {
    conf.team = parseInt(conf.team)
    conf.check = parseInt(conf.check)
    conf.round = parseInt(conf.round)

    var checker = Checker(conf.team),
        round = {},
        result = {};

    var go = function (level, check, rTeams) {
        if (level > conf.round) {
            return true
        }
        if (check > conf.check) {
            result[level] = round;
            round = {};
            checker.new_level();
            return go(level + 1, 1, {});
        }
        var rTeam1, rTeam2, rts;
        if (check == 1) {
            rTeam1 = randomArray(conf.team + (conf.check-conf.team/2))
            rTeam2 = randomArray(conf.team)
        } else {
            rTeam1 = rTeams[0]
            rTeam2 = rTeams[1]
        }
        for (var i in rTeam1) {
            var outerT = rTeam1[i];
            if (outerT > conf.team) {
                round[check] = ['', ''];
                rts = [clone(rTeam1), clone(rTeam2)];
                rts[0] = rts[0].filter(function (el) {return el != outerT});
                rts[1] = rts[1].filter(function (el) {return el != outerT});
                if ( go(level, check+1, rts) ) {
                    return true;
                }
            } else if( ! checker.played(outerT, check) ) {
                checker.play(outerT, check);
                
                for (var j in rTeam2) {
                    var innerT = rTeam2[j];
                    if ( outerT != innerT 
                    && ! checker.vsed(outerT, innerT) 
                    && ! checker.played(innerT, check) ) {
                        checker.vs(outerT, innerT);
                        checker.play(innerT, check);
                        round[check] = [outerT, innerT];
                        rts = [clone(rTeam1), clone(rTeam2)];
                        rts[0] = rts[0].filter(function (el) {return el != innerT && el != outerT});
                        rts[1] = rts[1].filter(function (el) {return el != innerT && el != outerT});
                        if ( go(level, check + 1, rts) ) {
                            return true;
                        }
                        checker.nvs(outerT, innerT);
                        checker.nplay(innerT, check);
                    }
                }
                
                checker.nplay(outerT, check);
            } else {
                ;
            }
        }
        return false;
    };

    var r = [go(1, 1), result];
    console.log(r)
    return r;
}

onmessage = function (oEvent) {
    var data = JSON.parse(oEvent.data);
    postMessage(JSON.stringify(Round(data)));
};