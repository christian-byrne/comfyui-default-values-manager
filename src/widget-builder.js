export class WidgetRecordBuilder {
  constructor() {
    this.widgetData = {};
    this.widgetRecord = {};
    this.selectedProps = ["label", "name", "type", "value"];
  }

  from(widgetData) {
    this.widgetData = widgetData;
    this.widgetRecord = {};
    return this;
  }

  inferType() {
    let widgetValueType = typeof this.widgetData.value;
    if (widgetValueType == "number" || widgetValueType == "slider") {
      if (this.widgetData.value % 1 !== 0) {
        widgetValueType = "float";
      } else {
        widgetValueType = "int";
      }
    }
    this.widgetRecord.valueType = widgetValueType;
    return this;
  }

  addAllowedVals() {
    if (this.widgetData?.options?.values) {
      this.widgetRecord["allowed values"] = this.widgetData.options.values;
    }
    return this;
  }

  addSelectedProps() {
    for (let prop of this.selectedProps) {
      if (this.widgetData[prop]) {
        this.widgetRecord[prop] = this.widgetData[prop];
      }
    }
    return this;
  }

  addDefaultVal(value) {
    if (value) {
      this.widgetRecord["userDefaulVal"] = value;
    }
    return this;
  }

  build() {
    const temp = this.widgetRecord;
    delete this.widgetRecord;
    return temp;
  }
}
