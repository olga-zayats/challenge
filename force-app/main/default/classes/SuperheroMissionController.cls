public with sharing class SuperheroMissionController {

    @AuraEnabled(cacheable=true)
    public static List <Superhero_Mission__c> getMissions(Integer offset, Integer numberOfRecords) {

        System.debug(offset);

        List<Superhero_Mission__c> result = [SELECT Complexity_Rank__c, Subject__c, Guild__r.Name, Status__c
            FROM Superhero_Mission__c
            ORDER BY CreatedDate ASC
            LIMIT :numberOfRecords
            OFFSET :offset];

        System.debug(result);
        return result;
    }

}