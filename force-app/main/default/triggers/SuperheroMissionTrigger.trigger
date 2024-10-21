trigger SuperheroMissionTrigger on Superhero_Mission__c (after insert, before update) {

    if (trigger.isAfter && trigger.isInsert) {
        Database.executeBatch(new SendEmailBatch(Trigger.new));
    }

}