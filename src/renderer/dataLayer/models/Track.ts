import { idProp, model, Model, modelAction, prop } from 'mobx-keystone';
import { formattedDuration } from '../../../helpers';

@model('Track')
class Track extends Model({
  id: idProp,
  title: prop<string>(),
  source: prop('youtube'),
  duration: prop(0),
  isLivestream: prop(false),
}) {
  getRefId() {
    return this.id;
  }

  get formattedDuration() {
    return formattedDuration(this.duration);
  }

  @modelAction
  setDuration(duration: number) {
    this.duration = duration;
  }
}

export default Track;
