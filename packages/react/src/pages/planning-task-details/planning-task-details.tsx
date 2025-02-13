import React, { useCallback, useEffect, useState } from 'react';
import './planning-task-details.scss';
import Toolbar, { Item as ToolbarItem } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import DropDownButton, { Item as DropDownItem } from 'devextreme-react/drop-down-button';
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';
import { TaskForm, CardActivities, CardNotes, CardMessages } from '../../components';
import { Task } from '../../shared/types/task';
import { getTask } from 'dx-rwa-data';

const TASK_ID = 1;

export const PlanningTaskDetails = () => {
  const [task, setTask] = useState<Task>();
  const [messagesCount, setMessagesCount] = useState(0);
  const loadData = useCallback(() => {
    getTask(TASK_ID)
      .then((data) => {
        setTask(data);
        setMessagesCount(data.messages.length);
      })
      .catch((error) => console.log(error));
  }, []);
  const updateMessagesCount = useCallback((count) => {
    setMessagesCount(count);
  }, []);
  useEffect(() => {
    loadData();
  }, [loadData]);
  const refresh = useCallback(() => loadData(), [loadData]);
  return (
    <div className='view-wrapper-details'>
      <Toolbar>
        <ToolbarItem location='before'>
          <Button icon='arrowleft'></Button>
        </ToolbarItem>
        <ToolbarItem location='before' text={task?.text} cssClass='toolbar-title'></ToolbarItem>
        <ToolbarItem location='after' locateInMenu='auto'>
          <DropDownButton text='ACTIONS' stylingMode='contained'>
            <DropDownItem text='Duplicate'></DropDownItem>
            <DropDownItem text='Close'></DropDownItem>
            <DropDownItem text='Delete'></DropDownItem>
          </DropDownButton>
        </ToolbarItem>
        <ToolbarItem
          location='after'
          locateInMenu='auto'
          widget='dxButton'
          showText='inMenu'
          options={{
            text: 'Attach',
            icon: 'attach',
          }}
        ></ToolbarItem>
        <ToolbarItem
          location='after'
          locateInMenu='auto'
          widget='dxButton'
          showText='inMenu'
          options={{
            text: 'Refresh',
            icon: 'refresh',
            onClick: refresh,
          }}
        ></ToolbarItem>
      </Toolbar>
      <div className='panels'>
        <div className='left'>
          <TaskForm task={task}></TaskForm>
        </div>
        <div className='right'>
          <div className='dx-card'>
            <TabPanel showNavButtons deferRendering={false}>
              <TabPanelItem title='Activities'>
                <CardActivities activities={task?.activities} />
              </TabPanelItem>
              <TabPanelItem title='Notes'>
                <CardNotes items={task?.notes} user={task?.owner}></CardNotes>
              </TabPanelItem>
              <TabPanelItem title='Messages' badge={messagesCount}>
                <CardMessages items={task?.messages} user={task?.owner} updateMessagesCount={updateMessagesCount}></CardMessages>
              </TabPanelItem>
            </TabPanel>
          </div>
        </div>
      </div>
    </div>
  );
};
