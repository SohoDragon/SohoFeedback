import * as React from 'react';
import styles from './SohoFeedback.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';
import ISohoFeedbackProps from "../models/ISohoFeedbackProps";
import ISohoFeedbackState from "../models/ISohoFeedbackState";
import ISPFeedbackItem from "../models/ISPFeedbackItem";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { sp, ItemAddResult } from "@pnp/sp";
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";

export default class SohoFeedback extends React.Component<ISohoFeedbackProps, ISohoFeedbackState> {
  public constructor(props: ISohoFeedbackProps) {
    super(props);
    this.state = {
      feedbackMessage: "",
      statusMessage: "",
      isLoading: false
    };
  }

  private feedbackMessageOnChange = (event: any, text: string): void => {
    this.setState({
      feedbackMessage: text,
      statusMessage: ""
    });
  };

  private submitOnClick = async (): Promise<void> => {
    await this.setState({ isLoading: true });

    try {
      await this.saveItem(this.state.feedbackMessage);
      await this.setState({ feedbackMessage: "", statusMessage: "Thank you for your feedback!" });
    } catch (e) {
      await this.setState({ statusMessage: "Sorry we are unable to submit your feedback, try again later." });
      console.log(e);
    }

    setTimeout(() => this.setState({ statusMessage: "" }), 5000); // remove the message after 5 seconds

    await this.setState({ isLoading: false });
  };

  private async saveItem(message: string) {
    let itemProperties: ISPFeedbackItem = {
      FeedbackMessage: message
    };
    return new Promise((resolve, reject) => {
      sp.web.lists
        .getByTitle("Feedback")
        .items.add(itemProperties)
        .then((itemAddResult: ItemAddResult) => {
          resolve(itemAddResult);
        })
        .catch(e => {
          reject(e);
        });
    });
  }

  public render(): JSX.Element {
    return (
      <div className={styles.sohoFeedback}>
        {this.state.isLoading && <Spinner className={styles.loader} size={SpinnerSize.large} />}
        <div className={styles.feedbackTitle}>Feedback</div>
        <div className={styles.feedbackStatus}>{this.state.statusMessage}</div>
        <TextField
          className={styles.feedbackTextField}
          multiline
          onChange={this.feedbackMessageOnChange}
          value={this.state.feedbackMessage}
        />
        <div className={styles.feedbackControls}>
          <PrimaryButton
            className={styles.feedbackButton}
            data-automation-id="submit-feedback"
            allowDisabledFocus={true}
            text="Submit"
            disabled={this.state.feedbackMessage.length <= 0}
            onClick={this.submitOnClick}
          />
        </div>
      </div>
    );
  }
}
