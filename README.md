GroundGame scheduler
====================

A scheduler for traditional ground game, helps you to play the schedule of ground game.

DEMO: http://ensky.tw/GroundGame/

大學營隊都會玩的大地遊戲，關主們每年都為了產生對戰組合而頭痛著

有了GroundGame scheduler就不用頭痛囉 :P

## 大地遊戲

大地遊戲是營隊的必玩遊戲之一，在營隊中通常會有偶數個隊伍，在大地遊戲中會兩兩對抗，通常對抗時有個關主評斷對抗的結果。而因為牽扯到兩兩對抗。因此根據「盡量不讓對抗組合重複」、以及「想辦法跑到所有的關」的這兩個條件，會有不同的組合

## Input & Output

Input: 1. 關卡數量 2. 總隊伍數量 3. 要跑幾關

Outout: 整個跑關表，也就是每一隊伍在時間內要跑哪些關、跟哪些隊伍對抗這樣

## Known issues

某些時候即使相同隊伍碰到兩次也沒關係，這些情況在這個版本中就沒有被考慮進去

## Contributers

+ [Ensky](http://www.ensky.tw): Front-end, deprecated algorithm A
+ [Hwchiu](https://www.facebook.com/hongwei.qiu): C version algorithm(active)

## Licence(MIT)

Copyright (C) 2014

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
