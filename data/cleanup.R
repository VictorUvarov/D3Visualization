library(readr)
library(tidyverse)

summer_csv <- read_csv("./summer.csv")
summer_csv <- summer_csv %>% mutate(Season = "Summer")
winter_csv <- read_csv("./winter.csv")
winter_csv <- winter_csv %>% mutate(Season = "Winter")
df <- winter_csv %>% rbind(summer_csv)

# total number of medals
df %>% count(Medal)

# total medals per year and country
df %>%
count(Year, Country) %>%
group_by(Year) %>%
arrange(Year, desc(n)) %>%
group_by(Year) %>%
slice(1) %>%
ungroup() %>%
arrange(Year)

# gold medals
gold <- df %>%
filter(Medal == 'Gold') %>%
count(Year, Country) %>%
group_by(Year) %>%
arrange(Year, desc(n)) %>%
group_by(Year)

colnames(gold)[3] <- 'Gold'

# silver medals
silver <- df %>%
filter(Medal == 'Silver') %>%
count(Year, Country) %>%
group_by(Year) %>%
arrange(Year, desc(n)) %>%
group_by(Year)

colnames(silver)[3] <- 'Silver'

# bronze medals
bronze <- df %>%
filter(Medal == 'Bronze') %>%
count(Year, Country) %>%
group_by(Year) %>%
arrange(Year, desc(n)) %>%
group_by(Year)

colnames(bronze)[3] <- 'Bronze'

# create final df
olympics_df <- merge(x=gold, y=silver, all.x=TRUE, all.y=TRUE)
olympics_df <- merge(x=olympics_df, y=bronze, all.x=TRUE, all.y=TRUE)
# replace NA with 0
olympics_df[is.na(olympics_df)] <- 0

# write csv
write.csv(x=olympics_df, file="./olympics.csv", row.names=FALSE)

# summer_olympics_csv <- dictionary_csv[,2]
# summer_olympics_csv <- merge(x=summer_olympics_csv, y=summer_csv, by.x='Code', by.y='Country')
# summer_olympics_csv <- summer_olympics_csv[,-(2:8)]
# 
# winter_olympics_csv <- dictionary_csv[,2]
# winter_olympics_csv <- merge(x=winter_olympics_csv, y=winter_csv, by.x='Code', by.y='Country')
# winter_olympics_csv <- winter_olympics_csv[,-(2:8)]
# 
# write.csv(x=summer_olympics_csv, file="./summer_olympics.csv", row.names=FALSE)
# write.csv(x=winter_olympics_csv, file="./winter_olympics.csv", row.names=FALSE)
