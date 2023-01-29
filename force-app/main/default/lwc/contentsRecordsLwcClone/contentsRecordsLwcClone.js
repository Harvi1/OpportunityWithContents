import { LightningElement, api, track, wire } from 'lwc';
import getoppwithcontentdata from '@salesforce/apex/OpportunityWithContents.getoppwithContentdata';
import retrieveContent from '@salesforce/apex/ShowbasedonsearchContentStageName.retrieveContent';
import { getRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
const FIELDS = ['Opportunity.Id', 'Opportunity.Name', 'Opportunity.StageName'];

const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'StageName', fieldName: 'StageName__c' },
];
export default class ContentsRecordsLwcClone extends LightningElement {
    @api recordId;
    @track opportunity;
    @track Contentdata = [];
    @track data;
    @track error;
    @track currentStageName;
    @track searchStageName;
    @track columns = columns;
    @track searchString;
    @track initialRecords;

    handlechangeStagename(event) {
        this.currentStageName = event.target.value;
        console.log('currentStageName.......' + event.target.value);
    }
    handleStageNameSearch() {
        console.log('searchStageName.......' + JSON.stringify(this.searchStageName));
        this.searchStageName = this.currentStageName;
    }
    @track records;
    @track dataNotFound;

    @wire(retrieveContent, { keySearch: '$searchStageName' })
    wireRecord({ data, error }) {
        if (data) {
            this.records = data;
            console.log('Check Data Here......' + this.records);
            this.error = undefined;
            this.dataNotFound = '';
            if (this.records == '') {
                this.dataNotFound = 'There is no Content found';
            }
        } else {
            this.error = error;
            this.data = undefined;
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredOpportunityData({ data, error }) {
        if (data) {
            this.opportunity = data;
            this.processRelatedObjects();
            this.updateRecordView();
            
            console.log(this.opportunity);
        } else if (error) {
            console.error('ERROR => ', JSON.stringify(error)); // handle error properly
        }
    }
    processRelatedObjects() {
        console.log('processRelatedObjects for => ', JSON.stringify(this.opportunity));
        console.log('Is refreshed???????');
        return refreshApex(this.wiredContentData);


        // further processing like refreshApex or calling another wire service
    }

    @wire(getoppwithcontentdata, { recordId: '$recordId' })
    wiredContentData({ error, data }) {
        if (data) {
            console.log(data);
            this.data = data;
            this.initialRecords = data;
            this.error = undefined;
            this.updateRecordView();
            this.checkprocessRelatedContents();
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }
    checkprocessRelatedContents() {
        console.log('checkprocessRelatedContents content =>' + JSON.stringify(this.initialRecords));
        console.log('check which data in data =>' + JSON.stringify(this.data));
        console.log('Is it Again refrshed or not??????');
        return refreshApex(this.initialRecords);
    }
      updateRecordView() {
        console.log('inside refresh');
        setTimeout(() => {
            eval("$A.get('e.force:refreshView').fire();");
        }, 100);
    }   
    /*handleClick() {
        this.handleIsLoading(true);
        retrieveContent({ recordId: this.recordId }).then(result => {
            this.showToast('Success', result, 'Success', 'dismissable');
            this.updateRecordView();
        }).catch(error => {
            this.showToast('Error updating or refreshing records', error.body.message, 'Error', 'dismissable');
        }).finally(() => {
            this.handleIsLoading(false);
        });
    }*/

}