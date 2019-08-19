install.packages("dplyr")
library(dplyr)

shots = read.csv("shots2.csv");
dat = data.frame("xMin" = NA, "xMax" = NA, "yMin" = NA, "yMax" = NA, "shotPercentage" = NA);
datRow = 1;
cellSize = 10;

for (i in seq(-250, 240, cellSize)) {
  for (j in seq(0, 290, cellSize)) {
    totShots = nrow(filter(shots, (LOC_X < i + cellSize & 
                                   LOC_X >= i & 
                                   LOC_Y < j + cellSize & 
                                   LOC_Y >= j)));
    madeShots = nrow(filter(shots, (LOC_X < i + cellSize & 
                                    LOC_X >= i & 
                                    LOC_Y < j + cellSize & 
                                    LOC_Y >= j &
                                    SHOT_MADE_FLAG == 1)));
    dat[datRow, "xMin"] = i;
    dat[datRow, "xMax"] = i + cellSize;
    dat[datRow, "yMin"] = j;
    dat[datRow, "yMax"] = j + cellSize;
    dat[datRow, "shotPercentage"] = madeShots * 100 / totShots;
    datRow = datRow + 1;
  }
}
dat[is.na(dat)] = 0
write.csv(x = dat, file = "leagueAverages.csv")
