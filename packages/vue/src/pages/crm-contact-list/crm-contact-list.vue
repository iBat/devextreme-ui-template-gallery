<template>
  <div class="view-wrapper">
    <dx-data-grid :data-source="dataSource"
                  height="100%"
                  class="grid"
                  @row-click="rowClick">

      <!-- Options -->
      <dx-scrolling :mode="'virtual'"/>
      <dx-column-chooser :enabled="true"/>
      <dx-sorting mode="multiple"/>
      <dx-header-filter :visible="true"/>
      <dx-load-panel :enabled="true" :show-pane="false"/>
      <dx-selection
          select-all-mode="allPages"
          show-check-boxes-mode="always"
          mode="multiple"
      ></dx-selection>
      <dx-search-panel
          :visible="true"
          placeholder="Contact Search"
      ></dx-search-panel>
      <dx-export :enabled="true" :allow-export-selected-data="true"></dx-export>

      <!-- Toolbar -->
      <dx-grid-toolbar>
        <dx-grid-toolbar-item location="before">
          <div class="grid-header">Contact List</div>
        </dx-grid-toolbar-item>

        <dx-grid-toolbar-item location="before" locateInMenu="auto">
          <dx-drop-down-button
              stylingMode="text"
              :width="160"
              :useSelectMode="true"
              :items="filterStatusList"
              :selectedItemKey="filterStatusList[0]"
              @selection-changed="filterByStatus"
          ></dx-drop-down-button>
        </dx-grid-toolbar-item>

        <dx-grid-toolbar-item
            location="after"
            locate-in-menu="auto"
            widget="dxButton"
            :options="{
            icon: 'plus',
            text: 'Add Contact',
            type: 'default',
            stylingMode: 'contained',
            onClick: addRow
          }"
        >
        </dx-grid-toolbar-item>

        <dx-grid-toolbar-item
            location="after"
            locate-in-menu="auto"
            show-text="inMenu"
            widget="dxButton"
            :options="{ text: 'Refresh', icon: 'refresh', onClick: refresh }"
        >
        </dx-grid-toolbar-item>

        <dx-grid-toolbar-item location="after" locate-in-menu="auto">
          <div class="separator"></div>
        </dx-grid-toolbar-item>

        <dx-grid-toolbar-item name="exportButton"></dx-grid-toolbar-item>

        <dx-grid-toolbar-item location="after" locate-in-menu="auto">
          <div class="separator"></div>
        </dx-grid-toolbar-item>

        <dx-grid-toolbar-item name="columnChooserButton" locateInMenu="auto"></dx-grid-toolbar-item>

        <dx-grid-toolbar-item name="searchPanel" locateInMenu="auto"></dx-grid-toolbar-item>
      </dx-grid-toolbar>

      <!-- Columns -->
      <dx-column data-field="name"
                  caption="Name"
                 sortOrder="asc"
                 cell-template="nameCellTemplate"
                 :hiding-priority="5"
                 :min-width="150" ><dx-required-rule/></dx-column>
      <dx-column data-field="company" caption="Company" :hiding-priority="5" :min-width="150" />
      <dx-column data-field="status"
          caption="Status"
          data-type="string"
          cell-template="statusCellTemplate"
          :hiding-priority="3"
          :min-width="100"
      />
      <dx-column data-field="assignedTo" caption="Assigned to" :hiding-priority="4" />
      <dx-column data-field="phone" caption="Phone"
                 :hiding-priority="2"
                 :customizeText="customizePhoneCell" >
        <dx-required-rule/>
      </dx-column>
      <dx-column data-field="email" caption="Email" :hiding-priority="1" >
        <dx-required-rule/>
      </dx-column>

      <!-- Templates  -->
      <template #nameCellTemplate="{ data }">
        <div class="name-template">
          <div>{{data.data.name}}</div>
          <div class="position">{{ data.data.position }}</div>
        </div>
      </template>

      <template #statusCellTemplate="{ data }">
        <user-status :status="data.data?.status"/>
      </template>

    </dx-data-grid>

    <!--  Contact panel  -->
    <contact-panel :user-id="panelData?.id"
                   :is-panel-open="isPanelOpen"
                   @close="isPanelOpen = false"/>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DxDropDownButton from 'devextreme-vue/drop-down-button';
import DxDataGrid, {
  DxColumn,
  DxColumnChooser,
  DxHeaderFilter,
  DxExport,
  DxLoadPanel,
  DxRequiredRule,
  DxSelection,
  DxScrolling,
  DxSorting,
  DxToolbar as DxGridToolbar,
  DxItem as DxGridToolbarItem,
  DxSearchPanel,
} from 'devextreme-vue/data-grid';
// eslint-disable-next-line import/no-unresolved
import { getContacts } from 'dx-rwa-data';

import { contactStatusList, Contact, ContactStatus } from '@/types/contact';
import { RowClickEvent } from 'devextreme/ui/data_grid';
import DataSource from 'devextreme/data/data_source';
import { SelectionChangedEvent } from 'devextreme/ui/drop_down_button';
import { formatPhone } from '@/utils/formatters';
import UserStatus from '@/components/user-status.vue';
import ContactPanel from './components/contact-panel.vue';

type FilterContactStatus = ContactStatus | 'All Contacts';

const panelData = ref<Array<Contact> | null>(null);
const isPanelOpen = ref(false);
const dataGrid = ref<InstanceType<typeof DxDataGrid> | null>(null);

const filterStatusList = ['All Contacts', ...contactStatusList];
const dataSource = new DataSource({
  key: 'id',
  load: () => getContacts(),
});

const rowClick = (e: RowClickEvent) => {
  if (e.data.id) {
    panelData.value = e.data;
    isPanelOpen.value = true;
  }
};

const addRow = () => {
  dataGrid.value?.instance.addRow();
};

const filterByStatus = (e: SelectionChangedEvent) => {
  const { item: status }: { item: FilterContactStatus } = e;

  if (status === 'All Contacts') {
    dataGrid.value?.instance.clearFilter();
  } else {
    dataGrid.value?.instance.filter(['status', '=', status]);
  }
};

const refresh = () => {
  dataSource.reload();
};

const customizePhoneCell = (cellInfo: {value: string}) => {
  const { value } = cellInfo;

  if (!value) {
    return undefined;
  }

  return formatPhone(value.toString());
};
</script>

<style scoped lang="scss">
@use "@/variables" as *;

.view-wrapper {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  &:deep(.grid)  {
    @include separator();

    .name-template {
      margin: -6px 0;
      .position {
        font-size: 12px;
        color: #757575de;
      }
    }

    .dx-datagrid-header-panel {
      padding-top: 20px;
      padding-bottom: 10px;
    }

    .clickable-row {
      cursor: pointer;
    }

    .grid-header {
      font-size: 22px;
      font-weight: 500;
      padding-right: 25px;
    }
  }
}

.edit-cell {
  position: relative;
}
</style>
