/*
 * @Author: Chao Deng && chaodeng987@outlook.com
 * @Date: 2026-01-20 08:39:31
 * @LastEditors: Chao Deng && chaodeng987@outlook.com
 * @LastEditTime: 2026-01-22 21:10:44
 * @FilePath: /rgcnformer_mobile_web/frontend/src/pages/MainPage.tsx
 * @Description: 
 * 那只是一场游戏一场梦
 *  
 * https://orcid.org/0009-0009-8520-1656
 * DOI: 10.3390/app15158626
 * DOI: 10.3390/rs17142354
 * Copyright (c) 2026 by ${Chao Deng}, All Rights Reserved. 
 */
import React, { useState } from 'react';
import { Select, Button, Card, message, Space, InputNumber } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useRna } from '../context/RnaContext';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { submitTask, generateJobId, type DatasetType } from '../lib/api';

const { Option } = Select;

const MainPage: React.FC = () => {
    const [localRnaSequence, setLocalRnaSequence] = useState("");
    const [localDataset, setLocalDataset] = useState<DatasetType>('Human');
    const [localDatasetIndex, setLocalDatasetIndex] = useState(0);

    const [localServer, setLocalServer] = useState('server1');
    const { setRnaSequence, setDataset, setDatasetIndex, setServer } = useRna();
    const navigate = useNavigate();
    const { t, changeLanguage, language } = useTranslation();

    const handleSubmit = async () => {
        try {
            setRnaSequence(localRnaSequence);
            setDataset(localDataset);
            setDatasetIndex(localDatasetIndex);
            setServer(localServer);

            const data = await submitTask({
                userId: 'user1',
                dataset: localDataset,
                datasetIndex: localDatasetIndex,
                jobId: generateJobId(),
            });

            navigate(`/results/${data.jobId}`);
        } catch (error: any) {
            console.error('Error submitting task:', error);
            message.error(t('Submit task failed: {message}').replace('{message}', error.message));
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{t('RNA Sequence Analysis')}</span>
                        <div>
                            <Button
                                onClick={() => changeLanguage('zh')}
                                disabled={language === 'zh'}
                                size="small"
                                type={language === 'zh' ? 'primary' : 'default'}
                            >
                                中文
                            </Button>
                            <Button
                                onClick={() => changeLanguage('en')}
                                disabled={language === 'en'}
                                size="small"
                                type={language === 'en' ? 'primary' : 'default'}
                                style={{ marginLeft: 8 }}
                            >
                                EN
                            </Button>
                        </div>
                    </div>
                }
                style={{ width: 800 }}
            >
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>{t('Dataset')}</label>
                    <Select value={localDataset} onChange={(value) => setLocalDataset(value)} style={{ width: '100%' }}>
                        <Option value="Human">Human</Option>
                        <Option value="Plant">Plant</Option>
                        <Option value="3Gen">3Gen</Option>
                    </Select>
                </div>
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>{t('Dataset Index')}</label>
                    <InputNumber
                        value={localDatasetIndex}
                        onChange={(value) => setLocalDatasetIndex(value ?? 0)}
                        min={0}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ margin: '20px 0' }}>
                    <Select value={localServer} onChange={(value) => setLocalServer(value)} style={{ width: '100%' }}>
                        <Option value="server1">{t('Server 1')}</Option>
                        <Option value="server2">{t('Server 2')}</Option>
                        <Option value="server3">{t('Server 3')}</Option>
                    </Select>
                </div>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Button type="primary" onClick={handleSubmit} block>
                        {t('Submit')}
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

export default MainPage;
