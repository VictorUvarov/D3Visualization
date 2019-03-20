library(readr)

summer_csv <- read_csv("./summer.csv")
winter_csv <- read_csv("./winter.csv")
dictionary_csv <- read_csv("./dictionary.csv")


summer_olympics_csv <- dictionary_csv[,2]
summer_olympics_csv <- merge(x=summer_olympics_csv, y=summer_csv, by.x='Code', by.y='Country')
summer_olympics_csv <- summer_olympics_csv[,-(2:8)]

winter_olympics_csv <- dictionary_csv[,2]
winter_olympics_csv <- merge(x=winter_olympics_csv, y=winter_csv, by.x='Code', by.y='Country')
winter_olympics_csv <- winter_olympics_csv[,-(2:8)]

write.csv(x=summer_olympics_csv, file="./summer_olympics.csv", row.names=FALSE)
write.csv(x=winter_olympics_csv, file="./winter_olympics.csv", row.names=FALSE)
