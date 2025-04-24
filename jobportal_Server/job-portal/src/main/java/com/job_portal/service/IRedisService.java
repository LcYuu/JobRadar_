package com.job_portal.service;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface IRedisService {
	public void set(String key, Object value);
	
	void setTimeToLive(String key, long timeoutInDays);
	
	void hashSet(String key, String field, Object value);
	
	boolean hashExists(String key, String field);
	
	Object get(String key);
	
	public Map<String, Object> getField(String key);
	
	Object hashGet(String key, String field);
	
	List<Object> hashGetByFieldPrefix(String key, String fieldPrefix);
	
	Set<String> getFieldPrefix(String key);
	
	void delete(String key);
	void delete(String key, String field);
	void delete(String key, List<String> fields);
	
}
	
