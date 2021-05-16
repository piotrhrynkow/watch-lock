import React from 'react';
import { connect, useSelector, useStore } from 'react-redux';
import { useForm } from 'react-hook-form';
import { sortBy } from 'lodash';
import { Store } from 'redux';
import Select, { clearSelect } from './input/Select';
import { addLog, watchPackModel } from '../../store/actions';
import { State } from '../../store';
import {
  selectModelUnwatchedPacks,
  selectUpdatedAtProcessing,
} from '../../store/selectors';
import UUIDProvider from '../../service/uuid-provider';
import { PackModelType, WatchedPackModelType } from '../../model/orm/types';

const PackageSelectForm = (props: {
  addLog: (payload: any) => void;
  watchPackModel: (payload: Partial<WatchedPackModelType>) => void;
}) => {
  const store: Store = useStore();
  const { addLog, watchPackModel } = props;

  useSelector(selectUpdatedAtProcessing);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<{ pack: string }>();
  const selectInputRef = React.useRef();

  const onSubmit = (data: { pack: { value: string } }) => {
    try {
      if (data.pack) {
        watchPackModel({
          id: UUIDProvider.getStoreUUID(store),
          enabled: true,
          packId: data.pack.value,
        });
        reset();
        clearSelect(selectInputRef);
      }
    } catch (error) {
      addLog(error.message);
    }
  };

  const packs: PackModelType[] = selectModelUnwatchedPacks(store.getState());
  const listPackOptions = sortBy(packs, 'name').map((pack: PackModelType) => ({
    value: pack.id,
    label: pack.name,
  }));

  return (
    <div className="form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="select-file">
            <Select
              name="pack"
              control={control}
              options={listPackOptions}
              inputRef={selectInputRef}
            />
          </div>
          <div className="select-add">
            <input
              type="submit"
              value="Add"
              disabled={isSubmitting || !listPackOptions.length}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

const mapStateToProps = (state: State) => {
  return {};
};
export default connect(mapStateToProps, { addLog, watchPackModel })(PackageSelectForm);
