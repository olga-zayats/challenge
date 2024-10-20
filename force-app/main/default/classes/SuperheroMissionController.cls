public without sharing class SuperheroMissionController {

    public class MissionWrapper {
        @AuraEnabled public String Id {get; set;}
        @AuraEnabled public String Rank {get; set;}
        @AuraEnabled public String Subject {get; set;}
        @AuraEnabled public String GuildName {get; set;}
        @AuraEnabled public String Status {get; set;}
    }

    @AuraEnabled(cacheable=true)
    public static List<MissionWrapper> getMissions(Integer offset, Integer numberOfRecords) {
        List<MissionWrapper> result = new List<MissionWrapper>();
        Hero__c currentHero = getCurrentHero();

        for (Superhero_Mission__c mission : [SELECT Complexity_Rank__c, Subject__c, Guild__r.Name,
            (SELECT Status__c FROM Mission_Assignments__r WHERE Hero__c = :currentHero?.Id)
            FROM Superhero_Mission__c
            WHERE Is_Public__c = true OR Guild__c = :currentHero?.Guild__c
            ORDER BY CreatedDate DESC
            LIMIT :numberOfRecords
            OFFSET :offset]) {
            MissionWrapper wrap = new MissionWrapper();
            wrap.Id = mission.Id;
            wrap.Rank = mission.Complexity_Rank__c;
            wrap.Subject = mission.Subject__c;
            wrap.GuildName = mission.Guild__r.Name;
            wrap.Status = mission.Mission_Assignments__r.isEmpty() ? 'Available' : mission.Mission_Assignments__r[0].Status__c;
            result.add(wrap);
        }

        return result;
    }

    private static Hero__c getCurrentHero() {
        List<Hero__c> currentUserHeroList = [SELECT Guild__c FROM Hero__c
            WHERE Contact__c IN (SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()) LIMIT 1];

        return currentUserHeroList.isEmpty()
            ? null
            : currentUserHeroList[0];
    }

    @AuraEnabled(cacheable=true)
    public static Superhero_Mission__c getMissionById(Id recordId) {
        return [SELECT Complexity_Rank__c, Subject__c, Guild__r.Name, Reward__c, Deadline__c,
            (SELECT Status__c FROM Mission_Assignments__r WHERE Hero__c = :getCurrentHero()?.Id)
            FROM Superhero_Mission__c
            WHERE Id = :recordId];
    }

    @AuraEnabled(cacheable=true)
    public static Hero__c getCurrentUserHero() {
        try {
            return [SELECT Rank__c FROM Hero__c
                WHERE Contact__c IN (SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()) LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public static void acceptMission() {

    }

}