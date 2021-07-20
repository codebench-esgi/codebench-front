import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import Editor from '@monaco-editor/react';
import React, { Fragment, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { RouteComponentProps } from 'react-router-dom';
import useBenchmarkDetail from '../../hooks/benchmark';
import useProcessInterval, {
  useLastSubmissionForUser,
} from '../../hooks/submissions';
import Result from './Result';
import Header from '../Page/Header';
import Page from '../Page/Page';
import Leaderboard from '../leaderboard/Leaderboard';
import { languagesList } from '../../assets/languages';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const languages = languagesList;

type BenchmarkDetailParams = {
  id: string;
};

const BenchmarkDetail = ({
  match,
}: RouteComponentProps<BenchmarkDetailParams>) => {
  const [selected, setSelected] = useState(languages[0]);

  //Get monaco instance to access code later
  const editorRef: any = useRef<null>(null);

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
  }

  let lastSubmission;
  const {
    isLoading: isLastSubmissionLoading,
    isError: isLastSubmissionError,
    data: lastSubmissionData,
    error: errorLastSubmission,
  } = useLastSubmissionForUser(match.params.id, selected.name);

  // Handle code submission and job result polling
  const {
    mutate,
    data: jobData,
    isLoading: isProcessing,
  } = useProcessInterval({
    onSuccess: (data: any) => console.log('Process finished', data),
    onError: (err: any) => console.log('Error with process', err),
  });

  let result;
  if (isProcessing) {
    result = 'Processing...';
  }
  if (jobData) {
    result = (
      <Result
        status={jobData.status}
        message={jobData.message}
        error={jobData.error}
        stderr={jobData.stderr}
        stdout={jobData.stdout}
        execDuration={jobData.execDuration}
        qualityScore={jobData.qualityScore}
        lintScore={jobData.lintScore}
      />
    );
  }

  const {
    isLoading: isBenchmarkLoading,
    isError: isBenchmarkError,
    data: benchmarkData,
    error,
  } = useBenchmarkDetail(match.params.id);

  if (isBenchmarkLoading) {
    return <span>Loading....</span>;
  }

  if (isBenchmarkError) {
    if (error) {
      return <span>Error: {error.message}</span>;
    }
  }

  if (isLastSubmissionLoading) {
    lastSubmission = 'Loading...';
  }

  if (isLastSubmissionError) {
    if (errorLastSubmission) {
      lastSubmission = "print('Welcome to Codebench !')";
    }
  }
  if (lastSubmissionData) {
    lastSubmission = lastSubmissionData.code;
  }

  return (
    <Page>
      <Header
        title={benchmarkData?.title || 'eee'}
        button="Back"
        navTo="/benchmarks"
      />
      <div className="flex p-4 overflow-hidden">
        <div className="grid flex-1">
          <div className="pl-8 pr-8 border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <div className="flex justify-between">
              <h1 className="text-2xl pb-3">Subject</h1>
              <div className="">
                <Listbox value={selected} onChange={setSelected}>
                  {({ open }) => (
                    <>
                      <Listbox.Label className="block text-sm font-medium text-gray-700">
                        Languages
                      </Listbox.Label>
                      <div className="mt-1 relative">
                        <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                          <span className="flex items-center">
                            <img
                              src={selected.avatar}
                              alt=""
                              className="flex-shrink-0 h-6 w-6 rounded-full"
                            />
                            <span className="ml-3 block truncate">
                              {selected.name}
                            </span>
                          </span>
                          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <SelectorIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>

                        <Transition
                          show={open}
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options
                            static
                            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                          >
                            {languages.map((language) => (
                              <Listbox.Option
                                key={language.id}
                                className={({ active }) =>
                                  classNames(
                                    active
                                      ? 'text-white bg-indigo-600'
                                      : 'text-gray-900',
                                    'cursor-default select-none relative py-2 pl-3 pr-9',
                                  )
                                }
                                value={language}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <div className="flex items-center">
                                      <img
                                        src={language.avatar}
                                        alt=""
                                        className="flex-shrink-0 h-6 w-6 rounded-full"
                                      />
                                      <span
                                        className={
                                          selected
                                            ? 'font-semibold'
                                            : 'font-normal' +
                                              'ml-3 block truncate'
                                        }
                                      >
                                        {language.name}
                                      </span>
                                    </div>

                                    {selected ? (
                                      <span
                                        className={classNames(
                                          active
                                            ? 'text-white'
                                            : 'text-indigo-600',
                                          'absolute inset-y-0 right-0 flex items-center pr-4',
                                        )}
                                      >
                                        <CheckIcon
                                          className="h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </>
                  )}
                </Listbox>
              </div>
            </div>
            <ReactMarkdown>{benchmarkData?.subject || ''}</ReactMarkdown>
          </div>
        </div>
        <div className="grid flex-1">
          <div className="bg-gray-500 rounded-lg h-96">
            <Editor
              onMount={handleEditorDidMount}
              height="100%"
              value={lastSubmission && lastSubmission}
              language={selected.name}
            />
            <div className="grid justify-items-stretch">
              <button
                className="justify-self-end bg-blue-500 hover:bg-blue-700 text-white font-bold mt-2 py-2 px-4 rounded"
                onClick={() => {
                  mutate({
                    code: editorRef.current.getValue(),
                    benchmarkId:
                      benchmarkData?.id !== undefined ? benchmarkData.id : '',
                    language: selected.name,
                  });
                }}
              >
                Run code
              </button>
            </div>
            <div className="justify-self-start ml-10">{result && result}</div>
          </div>
        </div>
        <Leaderboard benchmarkId={benchmarkData?.id ? benchmarkData.id : ''} />
      </div>
    </Page>
  );
};

export default BenchmarkDetail;
