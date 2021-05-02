import torch, math, time
import numpy as np

N_SAMPLES = 5
BATCH_SIZE = 5
MAX_LEN = 15
TOP_K = 100
TEMPERATURE = .8
GENERATION_MODE = "parallel-sequential"
LEED_OUT_LEN = 5 
BURNIN = 250
SAMPLE = True
MAX_ITER = 500
CUDA = torch.cuda.is_available()

class TextGen:

    CLS = '<s>'
    SEP = '</s>'
    MASK = '<mask>'

    def __init__(self, model, tokenizer):
        self.tokenizer = tokenizer 
        self.model = model

        # special token ids
        self.mask_id = tokenizer.convert_tokens_to_ids([self.MASK])[0]
        self.sep_id = tokenizer.convert_tokens_to_ids([self.SEP])[0]
        self.cls_id = tokenizer.convert_tokens_to_ids([self.CLS])[0]

        self.model.eval()
        if CUDA:
            self.model = self.model.cuda()

    def tokenize_batch(self, batch):
        return [self.tokenizer.convert_tokens_to_ids(sent) for sent in batch]

    def untokenize_batch(self, batch):
        return [self.tokenizer.convert_ids_to_tokens(sent) for sent in batch]

    def detokenize(self, sent):
        """ Roughly detokenizes (mainly undoes wordpiece) """
        new_sent = []
        for i, tok in enumerate(sent):
            if tok.startswith("##"):
                new_sent[len(new_sent) - 1] = new_sent[len(new_sent) - 1] + tok[2:]
            else:
                new_sent.append(tok)
        return new_sent


    def generate_step(self, out, gen_idx, temperature=None, top_k=0, sample=False, return_list=True):
        """ Generate a word from from out[gen_idx]
        
        args:
            - out (torch.Tensor): tensor of logits of size batch_size x seq_len x vocab_size
            - gen_idx (int): location for which to generate for
            - top_k (int): if >0, only sample from the top k most probable words
            - sample (Bool): if True, sample from full distribution. Overridden by top_k 
        """
        # out = out['logits']
        out = out[0]
        logits = out[:, gen_idx]
        if temperature is not None:
            logits = logits / temperature
        if top_k > 0:
            kth_vals, kth_idx = logits.topk(top_k, dim=-1)
            dist = torch.distributions.categorical.Categorical(logits=kth_vals)
            idx = kth_idx.gather(dim=1, index=dist.sample().unsqueeze(-1)).squeeze(-1)
        elif sample:
            dist = torch.distributions.categorical.Categorical(logits=logits)
            idx = dist.sample().squeeze(-1)
        else:
            idx = torch.argmax(logits, dim=-1)
        return idx.tolist() if return_list else idx
  
  
    def get_init_text(self, seed_text, max_len, batch_size = 1, rand_init=False):
        """ Get initial sentence by padding seed_text with either masks or random words to max_len """
        batch = [seed_text + [self.MASK] * max_len + [self.SEP] for _ in range(batch_size)]
        #if rand_init:
        #    for ii in range(max_len):
        #        init_idx[seed_len+ii] = np.random.randint(0, len(tokenizer.vocab))
        
        return self.tokenize_batch(batch)

    def post_processing(self, sentence):
        ret = sentence.replace('<_>', " ")
        ret = ret.replace('_', " ")
        ret = ret.replace('<s>', '')
        ret = ret.replace('</s>', '')
        return ret.strip(' ')

    def printer(self, sent, should_detokenize=True):
        if should_detokenize:
            sent = self.detokenize(sent)
        ret = "".join(sent)
        ret = self.post_processing(ret)
        return (ret)



    ## Generation modes as functions
    ##

    def parallel_sequential_generation(self, seed_text, batch_size=10, max_len=15, top_k=0, temperature=None, max_iter=300, burnin=200,
                                    cuda=False, print_every=10, verbose=True):
        """ Generate for one random position at a timestep
        
        args:
            - burnin: during burn-in period, sample from full distribution; afterwards take argmax
        """
        seed_len = len(seed_text)
        batch = self.get_init_text(seed_text, max_len, batch_size)
        
        for ii in range(max_iter):
            kk = np.random.randint(0, max_len)
            for jj in range(batch_size):
                batch[jj][seed_len+kk] = self.mask_id
            inp = torch.tensor(batch).cuda() if cuda else torch.tensor(batch)
            out = self.model(inp)
            topk = top_k if (ii >= burnin) else 0
            idxs = self.generate_step(out, gen_idx=seed_len+kk, top_k=topk, temperature=temperature, sample=(ii < burnin))
            for jj in range(batch_size):
                batch[jj][seed_len+kk] = idxs[jj]
                
            if verbose and np.mod(ii+1, print_every) == 0:
                for_print = self.tokenizer.convert_ids_to_tokens(batch[0])
                for_print = for_print[:seed_len+kk+1] + ['(*)'] + for_print[seed_len+kk+1:]
                print("iter", ii+1, " ".join(for_print))
                
        return self.untokenize_batch(batch)

    def parallel_generation(self, seed_text, batch_size=10, max_len=15, top_k=0, temperature=None, max_iter=300, sample=True, 
                            cuda=False, print_every=10, verbose=True):
        """ Generate for all positions at each time step """
        seed_len = len(seed_text)
        batch = self.get_init_text(seed_text, max_len, batch_size)
        
        for ii in range(max_iter):
            inp = torch.tensor(batch).cuda() if cuda else torch.tensor(batch)
            out = self.model(inp)
            for kk in range(max_len):
                idxs = self.generate_step(out, gen_idx=seed_len+kk, top_k=top_k, temperature=temperature, sample=sample)
                for jj in range(batch_size):
                    batch[jj][seed_len+kk] = idxs[jj]
                
            if verbose and np.mod(ii, print_every) == 0:
                print("iter", ii+1, " ".join(self.tokenizer.convert_ids_to_tokens(batch[0])))
        
        return self.untokenize_batch(batch)
                
    def sequential_generation(self, seed_text, batch_size=10, max_len=15, leed_out_len=15, 
                            top_k=0, temperature=None, sample=True, cuda=False):
        """ Generate one word at a time, in L->R order """
        seed_len = len(seed_text)
        batch = self.get_init_text(seed_text, max_len, batch_size)
        
        for ii in range(max_len):
            inp = [sent[:seed_len+ii+leed_out_len]+[self.sep_id] for sent in batch]
            print(inp)
            inp = torch.tensor(batch).cuda() if cuda else torch.tensor(batch)
            out = self.model(inp)
            idxs = self.generate_step(out, gen_idx=seed_len+ii, top_k=top_k, temperature=temperature, sample=sample)
            for jj in range(batch_size):
                batch[jj][seed_len+ii] = idxs[jj]
            
        return self.untokenize_batch(batch)


    def generate(self, n_samples=N_SAMPLES, seed_text="<s>", batch_size=BATCH_SIZE, max_len=MAX_LEN, 
                generation_mode=GENERATION_MODE, sample=SAMPLE, top_k=TOP_K, temperature=TEMPERATURE, 
                burnin=BURNIN, max_iter=MAX_ITER, cuda=CUDA, print_every=1, leed_out_len=LEED_OUT_LEN):
        # main generation function to call
        sentences = []
        n_batches = math.ceil(n_samples / batch_size)
        start_time = time.time()
        for batch_n in range(n_batches):
            if generation_mode == "parallel-sequential":
                batch = self.parallel_sequential_generation(seed_text, batch_size=batch_size, max_len=max_len, top_k=top_k,
                                                    temperature=temperature, burnin=burnin, max_iter=max_iter, 
                                                    cuda=cuda, verbose=False)
            elif generation_mode == "sequential":
                batch = self.sequential_generation(seed_text, batch_size=batch_size, max_len=max_len, top_k=top_k, 
                                            temperature=temperature, leed_out_len=leed_out_len, sample=sample,
                                            cuda=cuda)
            elif generation_mode == "parallel":
                batch = self.parallel_generation(seed_text, batch_size=batch_size,
                                            max_len=max_len, top_k=top_k, temperature=temperature, 
                                            sample=sample, max_iter=max_iter, 
                                            cuda=cuda, verbose=False)
            
            if (batch_n + 1) % print_every == 0:
                print("Finished batch %d in %.3fs" % (batch_n + 1, time.time() - start_time))
                start_time = time.time()
            
            sentences += batch
        return sentences

    def gen_sent(self, seed_text="<s>", max_len=MAX_LEN, n_samples=N_SAMPLES):
        # return ['hhhh']
        seed_text = self.tokenizer.tokenize(seed_text)
        print(f'seed text: {seed_text}')
        bert_sents = self.generate(n_samples, seed_text=seed_text, batch_size=BATCH_SIZE, max_len=max_len,
                            generation_mode=GENERATION_MODE,
                            sample=SAMPLE, top_k=TOP_K, temperature=TEMPERATURE, burnin=BURNIN, max_iter=MAX_ITER,
                            cuda=CUDA)
        outputs = []
        for sent in bert_sents:
            outputs.append(self.printer(sent, should_detokenize=False))
            return outputs