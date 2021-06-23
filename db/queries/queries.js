module.exports.ListAllQueryString = `select 
    records.id, 
    records.age, 
    workclasses.name as workclass, 
    education_levels.name as education_level, 
    records.education_num, 
    marital_statuses.name as marital_status, 
    occupations.name as occupation,
    relationships.name as relationship,
    races.name as race,
    sexes.name as sex,
    records.capital_gain,
    records.capital_loss,
    records.hours_week,
    records.country_id,
    records.over_50k
from records, countries, education_levels, marital_statuses, occupations, races, relationships, sexes, workclasses
where
    records.country_id == countries.id and
    records.education_level_id == education_levels.id and
    records.marital_status_id == marital_statuses.id and
    records.occupation_id == occupations.id and
    records.race_id == races.id and
    records.relationship_id == relationships.id and
    records.sex_id == sexes.id and
    records.workclass_id == workclasses.id
order by records.id
limit $limit
offset $offset`;

module.exports.AggregateByAgeQueryString = `select 
sum(capital_gain) as capital_gain_sum,
avg(capital_gain) as capital_gain_avg,
sum(capital_loss) as capital_loss_sum,
avg(capital_loss) as capital_loss_avg,
count(case when over_50k == 1 then 1 end) over_50k_count,
count(case when over_50k == 0 then 1 end) under_50k_count
from records
where age == $age`

module.exports.AggregateByEducationLevelIdQueryString = `select 
sum(capital_gain) as capital_gain_sum,
avg(capital_gain) as capital_gain_avg,
sum(capital_loss) as capital_loss_sum,
avg(capital_loss) as capital_loss_avg,
count(case when over_50k == 1 then 1 end) over_50k_count,
count(case when over_50k == 0 then 1 end) under_50k_count
from records
where education_level_id == $education_lvl_id`

module.exports.AggregateByOccupationIdQueryString = `select 
sum(capital_gain) as capital_gain_sum,
avg(capital_gain) as capital_gain_avg,
sum(capital_loss) as capital_loss_sum,
avg(capital_loss) as capital_loss_avg,
count(case when over_50k == 1 then 1 end) over_50k_count,
count(case when over_50k == 0 then 1 end) under_50k_count
from records
where occupation_id == $occupation_id`