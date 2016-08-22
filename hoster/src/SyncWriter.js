//CONSIDER: if the program dies prematurely then queued syncs may be lost!
/** Ensures only one sync is active at a time and tracks if new updates need processing */
class SyncWriter {
  /**
   * Create a sync tracker
   * @param {function} f - Function that executes a sync and returns a promise
   */
  constructor(f) {
    this.f = f;
    //tracks that an update is in progress
    this.lock = false;
    //tracks whether an update is scheduled
    this.flagged = false;
  }

  /**
   * Flag that another sync needs to happen
   */
  flag() {
    if (!this.lock) {
      this._sync(new Date());
    } else {
      this.flagged = new Date();
    }
  }

  _sync(timestamp) {
    this.lock = timestamp;
    return this.f().then(this._clearLock, this._clearLock);
  }

  _clearLock() {
    //processed the flagged update
    if (this.flagged == this.lock) {
      this.flagged = null;
      this.lock = null;
      return;
    }
    //an update was flagged while doing our update
    if (this.flagged) {
      this._sync(this.flagged)
    } else {
      //no updates to sync
      this.lock = null;
    }
  }
}

exports.SyncWriter = SyncWriter;
