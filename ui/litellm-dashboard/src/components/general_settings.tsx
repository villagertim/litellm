import { CheckCircleIcon, TrashIcon } from "@heroicons/react/outline";
import {
  Badge,
  Button,
  Card,
  Icon,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from "@tremor/react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react";
import { InputNumber } from "antd";
import type React from "react";
import { useEffect, useState } from "react";
import {
  deleteConfigFieldSetting,
  getGeneralSettingsCall,
  updateConfigFieldSetting,
} from "./networking";

import Fallbacks from "./Settings/RouterSettings/Fallbacks/Fallbacks";
import RouterSettings from "./router_settings";
import RoutingGroups from "./routing_groups";
interface GeneralSettingsPageProps {
  accessToken: string | null;
  userRole: string | null;
  userID: string | null;
  modelData: any;
}

interface generalSettingsItem {
  field_name: string;
  field_type: string;
  field_value: any;
  field_description: string;
  stored_in_db: boolean | null;
}

const GeneralSettings: React.FC<GeneralSettingsPageProps> = ({
  accessToken,
  userRole,
  userID,
  modelData,
}) => {
  const [generalSettings, setGeneralSettings] = useState<generalSettingsItem[]>(
    [],
  );

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    getGeneralSettingsCall(accessToken).then((data) => {
      const general_settings = data;
      setGeneralSettings(general_settings);
    });
  }, [accessToken]);

  const handleInputChange = (fieldName: string, newValue: any) => {
    // Update the value in the state
    const updatedSettings = generalSettings.map((setting) =>
      setting.field_name === fieldName
        ? { ...setting, field_value: newValue }
        : setting,
    );
    setGeneralSettings(updatedSettings);
  };

  const handleUpdateField = (fieldName: string, idx: number) => {
    if (!accessToken) {
      return;
    }

    const fieldValue = generalSettings[idx].field_value;

    if (fieldValue == null || fieldValue == undefined) {
      return;
    }
    try {
      updateConfigFieldSetting(accessToken, fieldName, fieldValue);
      // update value in state

      const updatedSettings = generalSettings.map((setting) =>
        setting.field_name === fieldName
          ? { ...setting, stored_in_db: true }
          : setting,
      );
      setGeneralSettings(updatedSettings);
    } catch (error) {
      // do something
    }
  };

  const handleResetField = (fieldName: string, idx: number) => {
    if (!accessToken) {
      return;
    }

    try {
      deleteConfigFieldSetting(accessToken, fieldName);
      // update value in state

      const updatedSettings = generalSettings.map((setting) =>
        setting.field_name === fieldName
          ? { ...setting, stored_in_db: null, field_value: null }
          : setting,
      );
      setGeneralSettings(updatedSettings);
    } catch (error) {
      // do something
    }
  };

  if (!accessToken) {
    return null;
  }

  return (
    <div className="w-full">
      <TabGroup className="h-[75vh] w-full">
        <TabList variant="line" defaultValue="1" className="px-8 pt-4">
          <Tab value="1">Loadbalancing</Tab>
          <Tab value="2">Routing Groups</Tab>
          <Tab value="3">Fallbacks</Tab>
          <Tab value="4">General</Tab>
        </TabList>
        <TabPanels className="px-8 py-6">
          <TabPanel>
            <RouterSettings
              accessToken={accessToken}
              userRole={userRole}
              userID={userID}
              modelData={modelData}
            />
          </TabPanel>
          <TabPanel>
            <RoutingGroups />
          </TabPanel>
          <TabPanel>
            <Fallbacks
              accessToken={accessToken}
              userRole={userRole}
              userID={userID}
              modelData={modelData}
            />
          </TabPanel>
          <TabPanel>
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Setting</TableHeaderCell>
                    <TableHeaderCell>Value</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {generalSettings
                    .filter((value) => value.field_type !== "TypedDictionary")
                    .map((value, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Text>{value.field_name}</Text>
                          <p
                            style={{
                              fontSize: "0.65rem",
                              color: "#808080",
                              fontStyle: "italic",
                            }}
                            className="mt-1"
                          >
                            {value.field_description}
                          </p>
                        </TableCell>
                        <TableCell>
                          {value.field_type == "Integer" ? (
                            <InputNumber
                              step={1}
                              value={value.field_value}
                              onChange={(newValue) =>
                                handleInputChange(value.field_name, newValue)
                              }
                            />
                          ) : value.field_type == "Boolean" ? (
                            <Switch
                              checked={
                                value.field_value === true ||
                                value.field_value === "true"
                              }
                              onChange={(checked) =>
                                handleInputChange(value.field_name, checked)
                              }
                            />
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {value.stored_in_db == true ? (
                            <Badge
                              icon={CheckCircleIcon}
                              className="text-white"
                            >
                              In DB
                            </Badge>
                          ) : value.stored_in_db == false ? (
                            <Badge className="text-gray bg-white outline">
                              In Config
                            </Badge>
                          ) : (
                            <Badge className="text-gray bg-white outline">
                              Not Set
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() =>
                              handleUpdateField(value.field_name, index)
                            }
                          >
                            Update
                          </Button>
                          <Icon
                            icon={TrashIcon}
                            color="red"
                            onClick={() =>
                              handleResetField(value.field_name, index)
                            }
                          >
                            Reset
                          </Icon>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default GeneralSettings;
